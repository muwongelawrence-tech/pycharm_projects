import React, {useEffect, useState, useRef, useContext} from 'react';
import {View, Text} from 'react-native';
import io from 'socket.io-client';
import {
  RTCView,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  MediaStream,
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
import {Satellite} from 'lucide-react-native';

const socket = io(BASE_URL);

// Initial RTCPeerConnection config
const peerConnectionConfig = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ],
};

const JoinLiveStreamScreen = ({navigation}) => {
  const route = useRoute();
  const {organizerId} = route.params;
  const {theme} = useContext(ThemeContext);
  const currentUser = useSelector(selectUser);
  const userId = currentUser?._id;
  const [stream, setStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Connecting to stream...');
  
  // MediaSoup references
  const consumerTransport = useRef(null);
  const device = useRef(null);
  const consumers = useRef([]);

  useEffect(() => {
    // Initialize socket connection
    socket.on('connect', () => {
      console.log('Socket connected');
      joinStream();
    });
    
    // Handle consumer transport creation
    socket.on('consumerTransportCreated', async (params) => {
      try {
        console.log('Consumer transport created by server', params);
        
        // Create new RTCPeerConnection
        const pc = new RTCPeerConnection(peerConnectionConfig);
        consumerTransport.current = pc;
        
        // Create a new local MediaStream to hold remote tracks
        const remoteStream = new MediaStream();
        
        // Handle incoming tracks
        pc.ontrack = (event) => {
          console.log('Received track', event.track.kind);
          remoteStream.addTrack(event.track);
          setStream(remoteStream);
          setConnectionStatus('Stream connected');
        };
        
        // Handle ICE candidates
        pc.onicecandidate = ({candidate}) => {
          if (candidate) {
            console.log('ICE candidate', candidate);
          }
        };
        
        // Create answer
        const offer = {
          type: 'offer',
          sdp: generateSDP(params)
        };
        
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        // Connect consumer transport when ICE gathering is complete
        pc.onicegatheringstatechange = () => {
          if (pc.iceGatheringState === 'complete') {
            console.log('ICE gathering complete');
            
            // Connect consumer transport
            socket.emit('connectConsumerTransport', {
              transportId: params.id,
              dtlsParameters: {
                role: 'client',
                fingerprints: pc.getLocalDescription().sdp
                  .match(/a=fingerprint:sha-256 .*/g)
                  .map(line => ({
                    algorithm: 'sha-256',
                    value: line.split(' ')[1]
                  }))
              }
            });
            
            // Request to consume the stream
            socket.emit('consume', {
              transportId: params.id,
              producerId: null, // The server will find the producerId
              rtpCapabilities: {
                codecs: [
                  {
                    kind: 'audio',
                    mimeType: 'audio/opus',
                    clockRate: 48000,
                    channels: 2
                  },
                  {
                    kind: 'video',
                    mimeType: 'video/VP8',
                    clockRate: 90000
                  }
                ],
                headerExtensions: []
              }
            });
          }
        };
      } catch (error) {
        console.error('Error setting up consumer transport:', error);
        setConnectionStatus('Error connecting to stream');
      }
    });
    
    // Handle consumed info
    socket.on('consumed', async (params) => {
      console.log('Media consumer created with ID:', params.id);
      consumers.current.push(params.id);
    });
    
    // Handle stream ended
    socket.on('streamEnded', ({organizerId: endedOrganizerId}) => {
      if (endedOrganizerId === organizerId) {
        setConnectionStatus('Stream has ended');
        setStream(null);
        
        if (consumerTransport.current) {
          consumerTransport.current.close();
          consumerTransport.current = null;
        }
        
        setTimeout(() => {
          navigation.navigate('HomeScreen');
        }, 3000);
      }
    });

    // Cleanup on component unmount
    return () => {
      socket.off('connect');
      socket.off('consumerTransportCreated');
      socket.off('consumed');
      socket.off('streamEnded');
      
      // Close consumer transport
      if (consumerTransport.current) {
        consumerTransport.current.close();
      }
      
      // Leave stream
      socket.emit('leaveStream', {organizerId, viewerId: userId});
    };
  }, []);

  // Helper function to generate SDP from server parameters
  const generateSDP = (params) => {
    // This would be implemented with proper SDP generation
    // For brevity, this is a simplified version
    return `v=0
o=- ${Date.now()} 1 IN IP4 127.0.0.1
s=-
t=0 0
a=group:BUNDLE 0 1
a=msid-semantic: WMS stream
m=audio 9 UDP/TLS/RTP/SAVPF 111
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:${params.iceParameters.usernameFragment}
a=ice-pwd:${params.iceParameters.password}
a=fingerprint:sha-256 ${params.dtlsParameters.fingerprints[0].value}
a=setup:active
a=mid:0
a=recvonly
a=rtpmap:111 opus/48000/2
a=candidate:1 1 udp 2130706431 ${params.iceCandidates[0].ip} ${params.iceCandidates[0].port} typ host
m=video 9 UDP/TLS/RTP/SAVPF 96
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:${params.iceParameters.usernameFragment}
a=ice-pwd:${params.iceParameters.password}
a=fingerprint:sha-256 ${params.dtlsParameters.fingerprints[0].value}
a=setup:active
a=mid:1
a=recvonly
a=rtpmap:96 VP8/90000
a=candidate:1 1 udp 2130706431 ${params.iceCandidates[0].ip} ${params.iceCandidates[0].port} typ host`;
  };

  const joinStream = () => {
    console.log(`Joining stream hosted by organizer: ${organizerId}`);
    socket.emit('joinStream', {organizerId, viewerId: userId});
  };

  const handleDisconnect = () => {
    navigation.navigate('HomeScreen');
  };

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
          <RTCView
            streamURL={stream.toURL()}
            style={{width: '100%', height: '100%'}}
            objectFit="cover"
            zOrder={1}
          />
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
                description={connectionStatus}
              />
            </View>
          </View>
        )}
      </View>
      
      <View className="w-full px-4 py-2">
        <View className="bg-gray-200 dark:bg-gray-700 rounded-lg p-2 mb-3">
          <Text className="text-center text-gray-700 dark:text-gray-300">
            {connectionStatus}
          </Text>
        </View>
      </View>

      <View className="w-full px-4 py-5">
        <PrimaryButton text={'Disconnect'} handlePress={handleDisconnect} />
      </View>
    </View>
  );
};

export default JoinLiveStreamScreen;



  {/* Chart Area */}
        <View style={styles.chartContainer}>
          {/* Y-axis Labels */}
          <View style={styles.yAxisLabels}>
            <Text style={styles.yAxisText}>40,000</Text>
            <Text style={styles.yAxisText}>20,000</Text>
            <Text style={styles.yAxisText}>0</Text>
          </View>

          {/* Chart */}
          <View style={styles.chartArea}>
            {/* Bars */}
            <View style={styles.barsContainer}>
              {Object.keys(dummyData.days).map(day => (
                <View key={day} style={styles.barColumn}>
                  <View
                    style={[
                      styles.bar,
                      {height: getBarHeight(dummyData.days[day])},
                    ]}
                  />
                </View>
              ))}
            </View>

            {/* X-axis Labels (Day Pills) */}
            <View style={styles.pillContainer}>
              {Object.keys(dummyData.days).map(day => (
                <TouchableOpacity
                  key={`pill-${day}`}
                  style={[
                    styles.pill,
                    selectedDay === day && styles.selectedPill,
                  ]}
                  onPress={() => handleDaySelect(day)}>
                  <Text
                    style={[
                      styles.pillText,
                      selectedDay === day && styles.selectedPillText,
                    ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        
        
          <div className="container mx-auto px-4 sm:px-8">
        {/* Header */}
        <div className="py-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              Team Management
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("teams")}
                className={`px-4 py-2 ${
                  activeTab === "teams"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700"
                } rounded-md`}
              >
                My Teams
              </button>
              {selectedTeam && (
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-4 py-2 ${
                    activeTab === "dashboard"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700"
                  } rounded-md`}
                >
                  Team Dashboard
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Teams List */}
        {activeTab === "teams" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-700">My Teams</h3>
              <button
                onClick={() => setShowCreateTeamModal(true)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create New Team
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Team Name
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sport
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created Date
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dummyTeams.map((team) => (
                    <tr key={team.id}>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <div className="flex items-center">
                          <div className="ml-3">
                            <p className="text-gray-900 whitespace-no-wrap font-medium">
                              {team.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {team.sport}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {team.memberCount}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {team.createdAt}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                        <button
                          onClick={() => handleSelectTeam(team)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                  {dummyTeams.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center"
                      >
                        No teams found. Create a new team to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Team Dashboard */}
        {activeTab === "dashboard" && selectedTeam && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-700">
                  {selectedTeam.name}
                </h3>
                <p className="text-gray-500">{selectedTeam.sport}</p>
              </div>
              <button
                onClick={() => setShowAddPlayerModal(true)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add Player
              </button>
            </div>

            {/* Team Members */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-700 mb-4">
                Team Members
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Permissions
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => {
                      const user = dummyUsers.find(
                        (u) => u.id === member.userId
                      );
                      return (
                        <tr key={member.id}>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10">
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-300 text-gray-700">
                                  {user?.name.charAt(0)}
                                </div>
                              </div>
                              <div className="ml-3">
                                <p className="text-gray-900 whitespace-no-wrap font-medium">
                                  {user?.name}
                                </p>
                                <p className="text-gray-500 whitespace-no-wrap">
                                  {user?.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {member.role}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <div className="flex flex-wrap gap-1">
                              {member.permissions.map((perm) => (
                                <span
                                  key={perm}
                                  className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                                >
                                  {perm}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            {member.userId !== currentUser.id && (
                              <button className="text-red-600 hover:text-red-800">
                                Remove
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Invitations */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-4">
                Pending Invitations
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Sent Date
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitations.map((invitation) => {
                      const user = dummyUsers.find(
                        (u) => u.id === invitation.userId
                      );
                      return (
                        <tr key={invitation.id}>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 w-10 h-10">
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-300 text-gray-700">
                                  {user?.name.charAt(0)}
                                </div>
                              </div>
                              <div className="ml-3">
                                <p className="text-gray-900 whitespace-no-wrap font-medium">
                                  {user?.name}
                                </p>
                                <p className="text-gray-500 whitespace-no-wrap">
                                  {user?.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <p className="text-gray-900 whitespace-no-wrap">
                              {invitation.sentAt}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                              {invitation.status}
                            </span>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                            <button
                              onClick={() =>
                                handleCancelInvitation(invitation.id)
                              }
                              className="text-red-600 hover:text-red-800"
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {invitations.length === 0 && (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center"
                        >
                          No pending invitations.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Create Team Modal */}
        {showCreateTeamModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-700">
                  Create New Team
                </h3>
                <button
                  onClick={() => setShowCreateTeamModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleCreateTeam}>
                <div className="mb-4">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="teamName"
                  >
                    Team Name
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="teamName"
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-6">
                  <label
                    className="block text-gray-700 text-sm font-bold mb-2"
                    htmlFor="teamSport"
                  >
                    Sport
                  </label>
                  <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="teamSport"
                    type="text"
                    value={teamSport}
                    onChange={(e) => setTeamSport(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowCreateTeamModal(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md"
                  >
                    Create Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Player Modal */}
        {showAddPlayerModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-700">
                  Add Player to Team
                </h3>
                <button
                  onClick={() => setShowAddPlayerModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users by name or email"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute left-3 top-2.5">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="mb-4 max-h-60 overflow-y-auto">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isAlreadyMember = teamMembers.some(
                      (m) => m.userId === user.id
                    );
                    const isPendingInvitation = invitations.some(
                      (i) => i.userId === user.id
                    );

                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 border-b cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-300 text-gray-700">
                              {user.name.charAt(0)}
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-gray-900 font-medium">
                              {user.name}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        {isAlreadyMember ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Member
                          </span>
                        ) : isPendingInvitation ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                            Invited
                          </span>
                        ) : (
                          <button
                            className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                            onClick={() => {
                              // In a real app, you'd dispatch an action to send invitation
                              const newInvitation = {
                                id: invitations.length + 1,
                                userId: user.id,
                                teamId: selectedTeam.id,
                                status: "pending",
                                sentAt: new Date().toISOString().split("T")[0],
                              };
                              setInvitations([...invitations, newInvitation]);
                            }}
                          >
                            Invite
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No users found</p>
                  </div>
                )}
              </div>

              {/* Player Role and Permissions Section */}
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-700 mb-2">
                  Player Role
                </h4>
                <select
                  className="w-full p-2 border rounded-lg"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="Player">Player</option>
                  <option value="Coach">Coach</option>
                  <option value="Manager">Manager</option>
                  <option value="Captain">Captain</option>
                </select>
              </div>

              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-700 mb-2">
                  Permissions
                </h4>
                <div className="flex flex-wrap gap-2">
                  <div
                    className={`px-3 py-1 rounded-full cursor-pointer ${
                      selectedPermissions.includes("view")
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => handleTogglePermission("view")}
                  >
                    View
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full cursor-pointer ${
                      selectedPermissions.includes("practice")
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => handleTogglePermission("practice")}
                  >
                    Practice
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full cursor-pointer ${
                      selectedPermissions.includes("manage")
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => handleTogglePermission("manage")}
                  >
                    Manage
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddPlayerModal(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPlayer}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Add Selected Players
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
