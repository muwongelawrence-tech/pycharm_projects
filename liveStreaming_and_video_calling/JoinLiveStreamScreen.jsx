import React, {useEffect, useState, useRef, useContext} from 'react';
import {View} from 'react-native';
import io from 'socket.io-client';
import {
  RTCView,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} from 'react-native-webrtc';
import {BASE_URL} from '../config/config';
import {useSelector} from 'react-redux';
import {selectUser} from '../redux/slices/authSlice';
import {useRoute} from '@react-navigation/native';
import {ThemeContext} from '../utils/ThemeContext';
import colors from '../config/colors';
import PrimaryNav from '../components/PrimaryNav';
import PrimaryButton from '../components/Buttons/PrimaryButton';
import AwarenessModal from '../components/modals/AwarenessModal';
import { Satellite } from 'lucide-react-native';
const socket = io(BASE_URL);

const JoinLiveStreamScreen = ({navigation}) => {
  const route = useRoute();
  const {organizerId} = route.params;
  const {theme} = useContext(ThemeContext);
  const currentUser = useSelector(selectUser);
  const userId = currentUser?._id;
  const [stream, setStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(
    'Connecting to stream...',
  );

  const peerConnections = useRef({});
  const pendingIceCandidates = useRef({});

  const peerConnectionConfig = {
    iceServers: [
      {
        urls: 'stun:stun.l.google.com:19302', // Free STUN server from Google ..
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

  useEffect(() => {
    const joinStream = () => {
      console.log(`Joining stream hosted by organizer: ${organizerId}`);
      socket.emit('join_stream', {organizerId: organizerId, viewerId: userId});
    };

    // Modify the peer connection creation process:
    socket.on('offer', async ({offer, organizerId}) => {
      console.log(`Received offer from Organizer ${organizerId}`);
      console.log(`Received OFFER ::-->  ${offer}`);
      setConnectionStatus('Received offer, establishing connection...');

      // Close any existing connections
      if (peerConnections.current[organizerId]) {
        peerConnections.current[organizerId].close();
      }

      const peer = new RTCPeerConnection(peerConnectionConfig);
      peerConnections.current[organizerId] = peer;

      // Add more logging for debugging ..
      peer.addEventListener('connectionstatechange', () => {
        console.log(`Peer connection state: ${peer.connectionState}`);

        if (peer.connectionState === 'connected') {
          setConnectionStatus('Connected to stream');
        } else if (peer.connectionState === 'failed') {
          setConnectionStatus('Connection failed. Try rejoining the stream.');
        } else if (peer.connectionState === 'disconnected') {
          setConnectionStatus('Disconnected from stream');
        }
      });

      peer.addEventListener('iceconnectionstatechange', () => {
        console.log(`ICE connection state: ${peer.iceConnectionState}`);
        if (peer.iceConnectionState === 'disconnected') {
          setConnectionStatus('ICE connection disconnected');
        } else if (peer.iceConnectionState === 'failed') {
          setConnectionStatus('ICE connection failed');
        }
      });

      // This is critical: handle incoming media tracks from organizer ..
      // peer.addEventListener('track', event => {

      //   console.log('Received track from organizer:', event.track.kind);
      //   if (event.streams && event.streams[0]) {
      //     console.log(
      //       'Setting remote stream with tracks:',
      //       event.streams[0]
      //         .getTracks()
      //         .map(t => t.kind)
      //         .join(', '),
      //     );
      //     setStream(event.streams[0]);
      //     setConnectionStatus('Stream connected');
      //   }
      // });

      peer.addEventListener('track', event => {
        console.log(
          'Received track from organizer:',
          event.track.kind,
          'enabled:',
          event.track.enabled,
        );
        if (event.streams && event.streams[0]) {
          console.log(
            'Setting remote stream with tracks:',
            event.streams[0]
              .getTracks()
              .map(t => `${t.kind} (enabled: ${t.enabled})`)
              .join(', '),
            'active:',
            event.streams[0].active,
          );
          setStream(event.streams[0]);
          setConnectionStatus('Stream connected');
        } else {
          console.warn('Received track but no stream available');
        }
      });

      // Handle ICE candidates ..
      peer.addEventListener('icecandidate', event => {
        if (event.candidate) {
          console.log('Sending ICE candidate to organizer');
          socket.emit('ice-candidate', {
            candidate: event.candidate,
            organizerId,
            viewerId: userId,
          });
        }
      });

      try {
        // Set remote description (the offer)
        await peer.setRemoteDescription(new RTCSessionDescription(offer));

        console.log('Remote Description set successfully');

        // Process any stored ICE candidates
        const storedCandidates = pendingIceCandidates.current[organizerId];
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

          // Clear stored candidates ..
          pendingIceCandidates.current[organizerId] = [];
        }

        // Create answer ..
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        // Send answer to organizer
        socket.emit('answer', {
          answer: peer.localDescription,
          organizerId,
          viewerId: userId,
        });

        console.log('Answer sent to organizer');

        // Rest of your existing code...
      } catch (err) {
        console.error('Error in handling offer:', err);
      }
    });

    // Handle incoming ICE candidates ..

    socket.on('ice-candidate', ({candidate, organizerId}) => {
      console.log('Received ICE candidate from organizer');
      const peer = peerConnections.current[organizerId];

      // If we don't have a remote description yet, store the candidate
      if (!peer || !peer.remoteDescription) {
        // Initialize array if needed
        if (!pendingIceCandidates.current[organizerId]) {
          pendingIceCandidates.current[organizerId] = [];
        }

        console.log('Storing ICE candidate for later use ::');
        pendingIceCandidates.current[organizerId].push(candidate);
      } else {
        // We have a remote description, add candidate right away
        if (candidate && candidate.candidate) {
          peer
            .addIceCandidate(new RTCIceCandidate(candidate))
            .then(() => console.log('ICE candidate added successfully'))
            .catch(err =>
              console.error('Error adding ICE candidate viewer side:', err),
            );
        }
      }
    });

    // ✅ CHANGE: Properly clean up when organizer disconnects
    socket.on('organizer_disconnected', ({organizerId}) => {
      const peer = peerConnections.current[organizerId];
      if (peer) {
        peer.close();
        delete peerConnections.current[organizerId];
        console.log(`Organizer ${organizerId} disconnected`);
      }
    });

    joinStream();

    // In both components, add this to the cleanup function:
    return () => {
      // Close all peer connections
      Object.values(peerConnections.current).forEach(peer => {
        if (peer) peer.close();
      });

      // Stop all tracks ..
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Remove socket listeners ..
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('viewer_disconnected');
      socket.off('organizer_disconnected');

      // Leave rooms
      socket.emit('leave_stream', {organizerId, viewerId: userId});
    };
  }, []);

  const handleDisconnect = () => {
    // Handle disconnecting the viewer from the stream ..
    navigation.navigate('HomeScreen');
  };

  console.log('CONNECTION STATUS Viewer side ::-->', connectionStatus);

  return (
    <View
      style={{
        backgroundColor:
          theme === 'light' ? colors.light.background : colors.dark.background,
      }}
      className="h-full flex-1">
      <PrimaryNav title={'Live Stream'} onPress={() => navigation.goBack()} />

      <View className="flex flex-1">
        {stream ? (
          <View className="w-full">
            {/* RTCView is used to display the video stream */}
            {stream && (
              <RTCView
                streamURL={stream.toURL()}
                style={{width: '100%', height: '100%'}}
              />
            )}
          </View>
        ) : (
          <View className="w-full flex flex-1 items-center justify-center">
            <View className="w-72">
              <AwarenessModal
                title={'Connecting ..'}
                Icon={
                  <Satellite
                    strokeWidth={1}
                    color={`${
                      theme === 'light' ? colors.light.icon : colors.dark.icon
                    }`}
                    size={40}
                  />
                }
                description={
                  'Waiting for live stream to display ..'
                }
              />
            </View>
          </View>
        )}
      </View>

      <View className="w-full px-4 py-5">
        <PrimaryButton text={'Disconnect'} handlePress={handleDisconnect} />
      </View>
    </View>
  );
};


export default JoinLiveStreamScreen;
