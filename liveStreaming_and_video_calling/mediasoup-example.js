const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mediasoup = require('mediasoup');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Global variables
let worker;
let router;
let producerTransport;
let consumerTransports = [];
let producer;
let consumers = [];

// MediaSoup settings
const mediaCodecs = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000
    }
  },
];

const startMediasoup = async () => {
  worker = await mediasoup.createWorker({
    logLevel: 'warn',
    rtcMinPort: 10000,
    rtcMaxPort: 10100,
  });

  router = await worker.createRouter({ mediaCodecs });

  worker.on('died', () => {
    console.error('MediaSoup worker died!');
    process.exit(1);
  });
};

// Start MediaSoup when server starts
startMediasoup();

// Socket.IO connection handling
io.on('connection', async (socket) => {
  
  console.log('Client connected:', socket.id);
  
  // Handle streamer starting a stream
  socket.on('startStream', async ({ organizerId }) => {
    socket.organizerId = organizerId;
    console.log(`Organizer ${organizerId} starting stream`);
    
    // Create WebRTC Transport for the producer (streamer)
    const transport = await createWebRtcTransport();
    producerTransport = transport;
    
    // Send transport parameters to the streamer
    socket.emit('transportCreated', {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters
    });
  });
  
  // Handle when streamer connects transport
  socket.on('connectProducerTransport', async ({ dtlsParameters }) => {
    await producerTransport.connect({ dtlsParameters });
    console.log('Producer transport connected');
  });
  
  // Handle when streamer starts producing media
  socket.on('produce', async ({ kind, rtpParameters }) => {
    producer = await producerTransport.produce({ kind, rtpParameters });
    console.log(`Producer started for ${kind}`);
    
    producer.on('transportclose', () => {
      console.log('Producer transport closed');
      producer = null;
    });
    
    socket.emit('produced', { id: producer.id });
    
    // Notify all viewers there's a new stream
    socket.broadcast.emit('newStream', { organizerId: socket.organizerId });
  });
  
  // Handle viewer joining stream
  socket.on('joinStream', async ({ organizerId, viewerId }) => {
    socket.viewerId = viewerId;
    console.log(`Viewer ${viewerId} joining stream from ${organizerId}`);
    
    // Create WebRTC Transport for this consumer (viewer)
    const transport = await createWebRtcTransport();
    
    // Add to list of consumer transports
    consumerTransports.push({
      id: transport.id,
      transport,
      socketId: socket.id,
      viewerId
    });
    
    // Send transport parameters to the viewer
    socket.emit('consumerTransportCreated', {
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters
    });
  });
  
  // Handle when viewer connects transport
  socket.on('connectConsumerTransport', async ({ transportId, dtlsParameters }) => {
    const consumerTransport = consumerTransports.find(ct => ct.id === transportId);
    if (consumerTransport) {
      await consumerTransport.transport.connect({ dtlsParameters });
      console.log('Consumer transport connected');
    }
  });
  
  // Handle viewer requesting to consume stream
  socket.on('consume', async ({ transportId, producerId, rtpCapabilities }) => {
    const consumerTransport = consumerTransports.find(ct => ct.id === transportId);
    
    if (!consumerTransport) {
      console.error('Consumer transport not found');
      return;
    }
    
    // Check if consumer can consume the producer
    if (!router.canConsume({
      producerId: producer.id,
      rtpCapabilities
    })) {
      console.error('Cannot consume');
      return;
    }
    
    // Create consumer
    const consumer = await consumerTransport.transport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: true  // Set to true to avoid initial flood of packets
    });
    
    consumers.push({
      id: consumer.id,
      consumer,
      socketId: socket.id,
      viewerId: consumerTransport.viewerId
    });
    
    // Send consumer info to viewer
    socket.emit('consumed', {
      id: consumer.id,
      producerId: producer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters
    });
    
    // Resume the consumer
    await consumer.resume();
    console.log('Consumer resumed');
  });
  
  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Clean up if the streamer disconnected
    if (socket.organizerId && producerTransport) {
      producerTransport.close();
      producerTransport = null;
      producer = null;
      
      // Close all consumer transports
      consumerTransports.forEach(ct => {
        ct.transport.close();
      });
      consumerTransports = [];
      consumers = [];
      
      io.emit('streamEnded', { organizerId: socket.organizerId });
    }
    
    // Clean up if a viewer disconnected
    if (socket.viewerId) {
      // Close and remove consumer transport
      const consumerTransport = consumerTransports.find(ct => ct.socketId === socket.id);
      if (consumerTransport) {
        consumerTransport.transport.close();
        consumerTransports = consumerTransports.filter(ct => ct.socketId !== socket.id);
      }
      
      // Remove consumers
      const viewerConsumers = consumers.filter(c => c.socketId === socket.id);
      viewerConsumers.forEach(c => {
        c.consumer.close();
      });
      consumers = consumers.filter(c => c.socketId !== socket.id);
    }
  });
});

// Helper function to create WebRTC Transport
async function createWebRtcTransport() {
  const transport = await router.createWebRtcTransport({
    listenIps: [
      {
        ip: '0.0.0.0',
        announcedIp: process.env.ANNOUNCED_IP || '127.0.0.1' // Use your server's public IP here
      }
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: 1000000,
  });
  
  return transport;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`MediaSoup server running on port ${PORT}`);
});
