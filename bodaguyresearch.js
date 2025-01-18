// Backend Implementation for Boda Guy Delivery App

// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const socketIO = require('socket.io');
const { createServer } = require('http');
const bodyParser = require('body-parser');
const firebaseAdmin = require('firebase-admin');

// Initialize Express app and HTTP server
const app = express();
const server = createServer(app);
const io = socketIO(server);

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/boda_guy', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('MongoDB connected');
});

// Firebase Admin Initialization
const firebaseConfig = require('./firebase-config.json'); // Firebase credentials JSON
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseConfig),
});

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  password: String,
  balance: { type: Number, default: 0 },
  deviceToken: { type: String, default: null }, // Added deviceToken
});
const User = mongoose.model('User', UserSchema);

const RiderSchema = new mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  password: String,
  vehicleType: String, // e.g., "Electric Motorcycle"
  location: { type: [Number], index: '2dsphere' },
  isAvailable: { type: Boolean, default: true },
  earnings: { type: Number, default: 0 },
  deviceToken: { type: String, default: null }, // Added deviceToken
});
const Rider = mongoose.model('Rider', RiderSchema);

const DeliverySchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', default: null },
  pickupLocation: { type: [Number], required: true },
  dropoffLocation: { type: [Number], required: true },
  packageDetails: {
    size: String,
    weight: Number,
    contents: String,
  },
  price: Number,
  status: { type: String, default: 'Pending' }, // e.g., Pending, In Transit, Completed
  createdAt: { type: Date, default: Date.now },
});
const Delivery = mongoose.model('Delivery', DeliverySchema);

// API Endpoints

// Create a new delivery
app.post('/deliveries', async (req, res) => {
  try {
    const { senderId, pickupLocation, dropoffLocation, packageDetails } = req.body;
    const price = calculatePrice(pickupLocation, dropoffLocation, packageDetails);

    const delivery = new Delivery({
      senderId,
      pickupLocation,
      dropoffLocation,
      packageDetails,
      price,
    });
    await delivery.save();
    res.status(201).json(delivery);

    notifyAvailableRiders(delivery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update delivery status
app.patch('/deliveries/:id', async (req, res) => {
  try {
    const { status, riderId } = req.body;
    const delivery = await Delivery.findByIdAndUpdate(req.params.id, { status, riderId }, { new: true });
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rider accepts a delivery
io.on('connection', (socket) => {
  console.log('A rider connected');

  socket.on('acceptDelivery', async ({ deliveryId, riderId }) => {
    const delivery = await Delivery.findById(deliveryId);
    if (delivery && delivery.status === 'Pending') {
      delivery.status = 'In Transit';
      delivery.riderId = riderId;
      await delivery.save();

      io.emit('deliveryAccepted', delivery);
    }
  });

  socket.on('disconnect', () => {
    console.log('A rider disconnected');
  });
});

// Helper Functions
function calculatePrice(pickupLocation, dropoffLocation, packageDetails) {
  const distance = getDistance(pickupLocation, dropoffLocation); // Use Mapbox API here
  const baseRate = 1000; // Example base rate in UGX
  const weightMultiplier = packageDetails.weight * 50; // Example multiplier
  return baseRate + distance * 10 + weightMultiplier;
}

function notifyAvailableRiders(delivery) {
  Rider.find({ isAvailable: true }, (err, riders) => {
    if (err) return;

    riders.forEach((rider) => {
      firebaseAdmin.messaging().sendToDevice(rider.deviceToken, {
        notification: {
          title: 'New Delivery Request',
          body: `Pickup: ${delivery.pickupLocation.join(', ')} - Dropoff: ${delivery.dropoffLocation.join(', ')}`,
        },
      });
    });
  });
}

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// but according to the user experience users always know names of places as pick up and drop off locactions , how will the backend process this  to get actual coordinates that will be used by the rider to follow the route on the map 
const axios = require('axios');

const geocodeLocation = async (locationName) => {
  const MAPBOX_ACCESS_TOKEN = 'your_mapbox_access_token';
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(locationName)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;

  try {
    const response = await axios.get(url);
    const [longitude, latitude] = response.data.features[0].center; // Extract coordinates
    return { latitude, longitude };
  } catch (error) {
    console.error('Error geocoding location:', error.message);
    throw new Error('Could not geocode the location.');
  }
};

// Example API endpoint
app.post('/geocode', async (req, res) => {
  const { pickup, dropoff } = req.body;

  try {
    const pickupCoords = await geocodeLocation(pickup);
    const dropoffCoords = await geocodeLocation(dropoff);

    res.status(200).json({
      pickup: { name: pickup, coordinates: pickupCoords },
      dropoff: { name: dropoff, coordinates: dropoffCoords },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process locations' });
  }
});

// Displaying the Delivety route on the Map  ..
import MapboxGL from '@rnmapbox/maps';
import axios from 'axios';

const getRoute = async (pickup, dropoff) => {
  const MAPBOX_ACCESS_TOKEN = 'your_mapbox_access_token';
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.longitude},${pickup.latitude};${dropoff.longitude},${dropoff.latitude}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;

  const response = await axios.get(url);
  return response.data.routes[0]; // Return the first route
};

const showRouteOnMap = async () => {
  const pickup = { latitude: 0.3317, longitude: 32.5825 }; // Example
  const dropoff = { latitude: 0.0467, longitude: 32.4431 };

  const route = await getRoute(pickup, dropoff);

  setRouteCoordinates(route.geometry.coordinates);
};

return (
  <MapboxGL.MapView style={{ flex: 1 }}>
    <MapboxGL.Camera
      centerCoordinate={[pickup.longitude, pickup.latitude]}
      zoomLevel={12}
    />
    <MapboxGL.ShapeSource id="routeSource" shape={{ type: 'LineString', coordinates: routeCoordinates }}>
      <MapboxGL.LineLayer id="routeLayer" style={{ lineColor: 'blue', lineWidth: 3 }} />
    </MapboxGL.ShapeSource>
  </MapboxGL.MapView>
);

// PICKING COORDINATES ON TAP OF THE USER INTERFACE  ..
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapboxGL from '@rnmapbox/maps';

MapboxGL.setAccessToken('YOUR_MAPBOX_ACCESS_TOKEN');

const PrechsMap = () => {
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);

  const handleMapPress = (event) => {
    const { geometry } = event;
    if (geometry && geometry.coordinates) {
      const [longitude, latitude] = geometry.coordinates;
      setSelectedCoordinates([longitude, latitude]);
    }
  };

  return (
    <View style={styles.container}>
      <MapboxGL.MapView
        style={styles.map}
        onPress={handleMapPress} // Listen for map presses
      >
        <MapboxGL.Camera
          zoomLevel={15}
          centerCoordinate={[32.5349, 0.1972]} // Initial map center
        />

        {/* Marker for selected location */}
        {selectedCoordinates && (
          <MapboxGL.PointAnnotation
            id="selectedLocation"
            coordinate={selectedCoordinates}
          />
        )}
      </MapboxGL.MapView>

      {/* Display selected coordinates */}
      {selectedCoordinates && (
        <View style={styles.infoContainer}>
          <Text>Selected Coordinates:</Text>
          <Text>
            Latitude: {selectedCoordinates[1]}, Longitude: {selectedCoordinates[0]}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    padding: 10,
    backgroundColor: 'white',
  },
});

export default PrechsMap;




