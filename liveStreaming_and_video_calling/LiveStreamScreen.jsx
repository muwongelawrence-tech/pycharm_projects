import React, {useRef, useState, useEffect, useContext} from 'react';
import {Alert, View} from 'react-native';
import {
  RTCView,
  mediaDevices,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
import io from 'socket.io-client';
import {BASE_URL} from '../config/config';
import {useSelector} from 'react-redux';
import {selectUser} from '../redux/slices/authSlice';
import {ThemeContext} from '../utils/ThemeContext';
import PrimaryButton from '../components/Buttons/PrimaryButton';
import colors from '../config/colors';
import PrimaryNav from '../components/PrimaryNav';

const socket = io(BASE_URL);

const LiveStreamScreen = ({navigation}) => {
  const {theme} = useContext(ThemeContext);
  const [stream, setStream] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Initializing...');
  const currentUser = useSelector(selectUser);
  const peerConnections = useRef({});
  const pendingIceCandidates = useRef({});
  const userId = currentUser?._id;

  // Define the STUN/TURN configuration here ..

  const peerConnectionConfig = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302', // Free STUN server from Google
      },
      {
        urls: [
          'turn:jb-turn1.xirsys.com:80?transport=udp', // Your TURN server URLs
          'turn:jb-turn1.xirsys.com:3478?transport=udp',
          'turn:jb-turn1.xirsys.com:80?transport=tcp',
          'turn:jb-turn1.xirsys.com:3478?transport=tcp',
          'turns:jb-turn1.xirsys.com:443?transport=tcp', // TURN over TLS
          'turns:jb-turn1.xirsys.com:5349?transport=tcp',
        ],
        username:
          '9B-T0I_ZrlLP6WX5d4QfvX53M1eR0mV89n-B155XSbPawuUI64FUWY2_fsobwDXxAAAAAGfIXHBNdXdvbmdlbGF3cmVuY2U=', // Your TURN server username
        credential: '40a6fc8c-f9cc-11ef-88bb-0242ac120004', // TURN server credential
      },
    ],
  };

  // let peerConnectionConfig = {
  //   iceServers: [
  //     {
  //       urls: 'stun:stun.l.google.com:19302',
  //     },
  //   ],
  // };

  // Socket connection status monitoring ..
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnectionStatus('Connection lost. Trying to reconnect...');
    });

    socket.on('connect_error', error => {
      console.error('Socket connection error:', error);
      setConnectionStatus('Connection error. Trying to reconnect...');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
    };
  }, []);

  useEffect(() => {
    const initializeStream = async () => {
      try {
        setConnectionStatus('Getting camera access...');
        const currentStream = await startStream();
        setConnectionStatus('Live streaming active');
        setIsStreaming(true);

        // Handle new viewers joining the stream
        socket.on('new_viewer', async ({viewerId}) => {
          console.log(`Viewer ${viewerId} joined the stream`);
          setConnectionStatus(`Connecting to viewer: ${viewerId}`);

          try {
            // Create a new peer connection for this viewer
            const peer = new RTCPeerConnection(peerConnectionConfig);
            peerConnections.current[viewerId] = peer;

            // Handle ICE candidates
            peer.addEventListener('icecandidate', event => {
              if (event.candidate) {
                console.log('Sending ICE candidate to viewer');
                socket.emit('ice-candidate', {
                  candidate: event.candidate,
                  viewerId,
                  organizerId: userId,
                });
              }
            });

            // Log connection state changes
            peer.addEventListener('connectionstatechange', () => {
              console.log(`Peer connection state: ${peer.connectionState}`);
              if (peer.connectionState === 'connected') {
                setConnectionStatus('Connected to viewer');
              } else if (peer.connectionState === 'failed') {
                setConnectionStatus('Connection failed with viewer');
              }
            });

            peer.addEventListener('icegatheringstatechange', () => {
              console.log(`ICE gathering state: ${peer.iceGatheringState}`);
            });

            console.log(
              `Stream has ${currentStream.getTracks().length} tracks:`,
              currentStream
                .getTracks()
                .map(t => `${t.kind} (enabled: ${t.enabled})`),
            );

            // Add all tracks from our stream to the peer connection
            currentStream.getTracks().forEach(track => {
              console.log(`Adding track to peer connection: ${track.kind}`);
              peer.addTrack(track, currentStream);
            });
            console.log(
              'ICE gathering complete, creating and sending offer...',
            );

            try {
              console.log('Creating offer for viewer');

              const offer = await peer.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
              });

              await peer.setLocalDescription(offer);

              if (peer.localDescription) {
                console.log('Local description set, sending offer to viewer');

                socket.emit('offer', {
                  offer: peer.localDescription,
                  viewerId,
                  organizerId: userId,
                });
              }
            } catch (error) {
              console.error('Error creating or sending offer:', error);
            }
          } catch (error) {
            console.error('Error setting up peer connection:', error);
            setConnectionStatus('Error connecting to viewer');
          }
        });

        // Modify your ICE candidate handler
        socket.on('ice-candidate', ({candidate, viewerId}) => {
          console.log(`Received ICE candidate from viewer: ${viewerId}`);
          const peer = peerConnections.current[viewerId];

          // If we don't have a remote description yet, store the candidate
          if (!peer || !peer.remoteDescription) {
            // Initialize array if needed
            if (!pendingIceCandidates.current[viewerId]) {
              pendingIceCandidates.current[viewerId] = [];
            }

            console.log('Storing ICE candidate for later');
            pendingIceCandidates.current[viewerId].push(candidate);
          } else {
            // We have a remote description, add candidate right away
            if (candidate && candidate.candidate) {
              peer
                .addIceCandidate(new RTCIceCandidate(candidate))
                .catch(err =>
                  console.error(
                    'Error adding ICE candidate organizer side:',
                    err,
                  ),
                );
            }
          }
        });

        // Modify your answer handler to process stored candidates
        socket.on('answer', async ({viewerId, answer}) => {
          console.log(`Received answer from viewer: ${viewerId}`);
          const peer = peerConnections.current[viewerId];

          if (!peer) {
            console.error(`No peer connection found for viewer: ${viewerId}`);
            return;
          }

          try {
            // Set the remote description (the answer from the viewer)
            await peer.setRemoteDescription(new RTCSessionDescription(answer));
            console.log('Set remote description from viewer');

            // Now process any stored ICE candidates
            const storedCandidates = pendingIceCandidates.current[viewerId];
            if (storedCandidates && storedCandidates.length > 0) {
              console.log(
                `Processing ${storedCandidates.length} stored ICE candidates`,
              );

              for (const candidate of storedCandidates) {
                if (candidate && candidate.candidate) {
                  await peer
                    .addIceCandidate(new RTCIceCandidate(candidate))
                    .catch(err =>
                      console.error('Error adding stored ICE candidate:', err),
                    );
                }
              }

              // Clear stored candidates
              pendingIceCandidates.current[viewerId] = [];
            }
          } catch (error) {
            console.error('Error setting remote description:', error);
          }
        });

        // Handle viewer disconnection
        socket.on('viewer_disconnected', ({viewerId}) => {
          console.log(`Viewer ${viewerId} disconnected`);
          const peer = peerConnections.current[viewerId];
          if (peer) {
            peer.close();
            delete peerConnections.current[viewerId];
          }
        });
      } catch (error) {
        console.error('Failed to initialize stream:', error);
        setConnectionStatus('Failed to start stream');
        Alert.alert('Error', 'Failed to start stream: ' + error.message);
      }
    };

    initializeStream();

    // Clean up on component unmount
    return () => {
      stopStream();
      socket.off('new_viewer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('viewer_disconnected');
    };
  }, []);

  const startStream = async () => {
    try {
      // Get local media stream
      // const constraints = {
      //   audio: true,
      //   video: {
      //     width: {ideal: 640, max: 1280},  // Lower initial resolution
      //     height: {ideal: 480, max: 720},
      //     frameRate: {ideal: 15, max: 24}  // Lower framerate to start
      //   }
      // };

      const constraints = {
        audio: true,
        video: true, // Simplify to basic video constraints
      };

      const localStream = await mediaDevices.getUserMedia(constraints);
      setStream(localStream);

      // Notify server that we're starting a stream
      socket.emit('start_stream', {organizerId: userId});

      // Add tracks to all existing peer connections
      Object.values(peerConnections.current).forEach(peer => {
        localStream.getTracks().forEach(track => {
          peer.addTrack(track, localStream);
        });
      });

      return localStream;
    } catch (error) {
      console.error('Error getting user media:', error);
      throw error;
    }
  };

  const stopStream = () => {
    if (stream) {
      // Stop all tracks
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }

    // Close all peer connections
    Object.keys(peerConnections.current).forEach(key => {
      const peer = peerConnections.current[key];
      if (peer) {
        peer.close();
      }
    });

    peerConnections.current = {};

    // Notify server that we're ending the stream
    socket.emit('end_stream', {organizerId: userId});
    setIsStreaming(false);

    navigation.navigate('HomeScreen');
  };

  console.log('CONNECTION STATUS Organizer side ::-->', connectionStatus);

  return (
    <View
      style={{
        backgroundColor:
          theme === 'light' ? colors.light.background : colors.dark.background,
      }}
      className="h-full flex-1">
      <PrimaryNav title={'Live Stream'} onPress={() => navigation.goBack()} />
      <View className="flex flex-1">
        {stream && (
          <RTCView
            streamURL={stream.toURL()}
            style={{width: '100%', height: '100%'}}
          />
        )}
      </View>

      <View className="w-full px-4 py-5">
        <PrimaryButton text={'End Stream'} handlePress={stopStream} />
      </View>
    </View>
  );
};

export default LiveStreamScreen;
