'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { getSocket } from '@/lib/socket'
import SpinWheel from '@/components/wheel/spin-wheel'
import WheelManagement from '@/components/wheel/WheelManagement'

export default function Room({ params }: { params: { code: string } }) {
  const searchParams = useSearchParams()
  const name = searchParams?.get("name") || "Guest"
  const isOwner = searchParams?.get("owner") === "true"
  const roomCode = params.code

  const [messages, setMessages] = useState<Array<{name: string, message: string, timestamp?: Date}>>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [chat, setChat] = useState("");
  const [result, setResult] = useState("");
  const [connected, setConnected] = useState(false);
  const [roomOwner, setRoomOwner] = useState<string>("");
  const [joinNotification, setJoinNotification] = useState<string>("");
  const [isClient, setIsClient] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  // Wheel options - make them manageable
  const [wheelOptions, setWheelOptions] = useState([
    { id: '1', label: '🍎 Apple', color: '#ef4444', weight: 1 },
    { id: '2', label: '🍌 Banana', color: '#eab308', weight: 1 },
    { id: '3', label: '🍊 Orange', color: '#f97316', weight: 1 },
    { id: '4', label: '🍇 Grape', color: '#8b5cf6', weight: 1 },
    { id: '5', label: '🍓 Strawberry', color: '#ec4899', weight: 1 },
    { id: '6', label: '🥝 Kiwi', color: '#22c55e', weight: 1 }
  ]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const socket = getSocket();
    
    // Remove any existing listeners to prevent duplicates
    socket.off('connect');
    socket.off('disconnect');
    socket.off('room_joined');
    socket.off('user_joined');
    socket.off('user_left');
    socket.off('receive_message');
    socket.off('spin_start');
    socket.off('spin_result');
    socket.off('wheel_options_updated');
    socket.off('room_closed');
    socket.off('error');
    
    // Only connect if not already connected
    if (!socket.connected) {
      socket.connect();
    } else {
      // If already connected, join room immediately
      setConnected(true);
      socket.emit("join_room", { roomCode, name, isOwner });
    }
    
    socket.on('connect', () => {
      console.log('Socket connected, joining room...');
      setConnected(true);
      socket.emit("join_room", { roomCode, name, isOwner });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socket.on("room_joined", ({ owner, participants: roomParticipants }) => {
      console.log('Room joined event received:', { owner, participants: roomParticipants });
      setRoomOwner(owner);
      setParticipants(roomParticipants);
    });

    socket.on("user_joined", ({ name: joinedName, participants: roomParticipants, message }) => {
      console.log('User joined:', joinedName);
      setParticipants(roomParticipants);
      setJoinNotification(message);
      setTimeout(() => setJoinNotification(""), 3000);
    });

    socket.on("user_left", ({ name: leftName, participants: roomParticipants, message }) => {
      console.log('User left:', leftName);
      setParticipants(roomParticipants);
      setJoinNotification(message);
      setTimeout(() => setJoinNotification(""), 3000);
    });

    socket.on("receive_message", (msg: {name: string, message: string, timestamp: Date}) => {
      console.log('Message received:', msg);
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("spin_start", (data: {result: string, rotation: number, duration: number, spinnerId: string}) => {
      console.log('Spin start received:', data);
      setIsSpinning(true);
      setResult(""); // Clear previous result
    });

    socket.on("spin_result", (data: {result: string, spinnerId: string}) => {
      console.log('Spin result received:', data);
      setResult(data.result);
      setIsSpinning(false);
    });

    socket.on("wheel_options_updated", (data: {options: any[], updatedBy: string}) => {
      console.log('Wheel options updated by:', data.updatedBy);
      setWheelOptions(data.options);
    });

    socket.on("room_closed", ({ message }) => {
      alert(message);
      window.location.href = "/room";
    });

    socket.on("error", ({ message }) => {
      console.error('Socket error:', message);
      alert(`Error: ${message}`);
    });

    return () => {
      console.log('Cleaning up - keeping connection but removing listeners');
      // Don't disconnect, just remove listeners
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room_joined');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('receive_message');
      socket.off('spin_start');
      socket.off('spin_result');
      socket.off('wheel_options_updated');
      socket.off('room_closed');
      socket.off('error');
    };
  }, [roomCode, name, isOwner, isClient]);

  function sendMessage() {
    if (chat.trim() && connected) {
      const socket = getSocket();
      socket.emit("chat_message", { roomCode, name, message: chat });
      setChat("");
    }
  }

  function updateWheelOptions(options: any[]) {
    if (!isOwner || !connected) return;
    
    setWheelOptions(options);
    const socket = getSocket();
    socket.emit("update_wheel_options", { 
      roomCode, 
      options,
      updatedBy: name 
    });
  }

  function spinWheel() {
    console.log('Spin wheel clicked!', { connected, isOwner, roomCode, name });
    
    if (!connected) {
      console.log('Not connected to socket');
      return;
    }
    
    if (!isOwner) {
      console.log('User is not owner');
      return;
    }
    
    if (isSpinning) {
      console.log('Already spinning');
      return;
    }

    if (wheelOptions.length === 0) {
      alert('Please add some wheel options first!');
      return;
    }
    
    // Set local spinning state
    setIsSpinning(true);
    
    // Weight-based random selection
    const totalWeight = wheelOptions.reduce((sum, opt) => sum + (opt.weight || 1), 0);
    let random = Math.random() * totalWeight;
    let selectedOption = wheelOptions[0];
    
    for (const option of wheelOptions) {
      random -= (option.weight || 1);
      if (random <= 0) {
        selectedOption = option;
        break;
      }
    }
    
    const socket = getSocket();
    
    console.log('Emitting spin_start event', { roomCode, result: selectedOption.label });
    
    // Emit spin start to synchronize animation across all clients
    socket.emit("spin_start", { 
      roomCode, 
      result: selectedOption.label,
      rotation: 2000 + Math.random() * 2000, // 2000-4000 degrees
      duration: 4 // 4 seconds
    });
    
    // After 4 seconds, emit the final result
    setTimeout(() => {
      console.log('Emitting spin_result event', { roomCode, result: selectedOption.label });
      socket.emit("spin_wheel", { 
        roomCode, 
        result: selectedOption.label,
        rotation: Math.random() * 360 
      });
    }, 4000);
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (!isClient) {
    return (
      <div className="flex flex-col items-center mt-10 p-4">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-3xl font-bold text-blue-600 mb-4">
            🎡 Loading Room...
          </h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-10 p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-blue-600 text-center mb-2">
          🎡 Room: {roomCode}
        </h1>
        
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className={`text-sm ${connected ? 'text-green-600' : 'text-red-600'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {isOwner && (
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold">
              👑 Room Owner
            </span>
          )}
        </div>

        {joinNotification && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-center">
            <p className="text-blue-700 text-sm">{joinNotification}</p>
          </div>
        )}

        {/* Participants */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">
            Participants ({participants.length}):
          </h3>
          <div className="flex flex-wrap gap-2">
            {participants.map((p, i) => (
              <span 
                key={i} 
                className={`px-3 py-1 rounded-full text-sm ${
                  p === name 
                    ? 'bg-blue-100 text-blue-800 font-semibold' 
                    : p === roomOwner 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {p === name ? `${p} (You)` : p} 
                {p === roomOwner && ' 👑'}
              </span>
            ))}
          </div>
        </div>

        {/* Wheel Management */}
        <div className="mb-6">
          <WheelManagement
            options={wheelOptions}
            onOptionsChange={updateWheelOptions}
            isOwner={isOwner}
            disabled={!connected || isSpinning}
          />
        </div>

        {/* Spin Wheel */}
        <div className="bg-white border rounded-lg p-6 mb-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Spin the Wheel!</h3>
          {!isOwner && (
            <p className="text-sm text-gray-600 mb-3">
              Only the room owner ({roomOwner}) can spin the wheel
            </p>
          )}
          
          <div className="flex justify-center mb-4">
            <SpinWheel
              options={wheelOptions}
              spinning={isSpinning}
              onSpinComplete={(result: any) => {
                console.log('Wheel spin completed locally:', result);
                // Don't set result here - let it come from server
              }}
              spinDuration={4}
              theme={{
                backgroundColor: '#1e293b',
                pointerColor: '#ef4444',
                borderColor: '#ffffff'
              }}
            />
          </div>
          
          {!isOwner && (
            <p className="text-sm text-orange-600 font-semibold">
              Watch the wheel - only {roomOwner} can control it!
            </p>
          )}
          
          {isOwner && (
            <button
              onClick={spinWheel}
              disabled={!connected || isSpinning || wheelOptions.length === 0}
              className={`px-8 py-4 rounded-lg text-lg font-semibold transition-colors ${
                connected && !isSpinning && wheelOptions.length > 0
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              }`}
            >
              🎡 {isSpinning ? 'Spinning...' : wheelOptions.length === 0 ? 'Add Options First' : 'Spin Wheel'}
            </button>
          )}
          
          {result && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-lg text-green-700 font-semibold">
                🎉 Result: {result}
              </p>
            </div>
          )}
        </div>

        {/* Chat Section - Messenger Style */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="bg-blue-600 text-white p-4">
            <h3 className="font-semibold flex items-center gap-2">
              💬 Room Chat
              <span className="text-blue-200 text-sm">({participants.length} online)</span>
            </h3>
          </div>
          
          <div className="h-64 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="text-4xl mb-2">💬</div>
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`mb-3 flex ${m.name === name ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start gap-2 max-w-xs ${m.name === name ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Profile Avatar */}
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                        m.name === name ? 'bg-blue-500' : 
                        m.name === roomOwner ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}>
                        {m.name.charAt(0).toUpperCase()}
                        {m.name === roomOwner && '👑'}
                      </div>
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`rounded-lg px-3 py-2 ${
                      m.name === name 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white border shadow-sm'
                    }`}>
                      {m.name !== name && (
                        <div className="text-xs font-semibold mb-1 text-gray-600">
                          {m.name} {m.name === roomOwner && '👑'}
                        </div>
                      )}
                      <div className="text-sm">{m.message}</div>
                      {m.timestamp && (
                        <div className={`text-xs mt-1 ${m.name === name ? 'text-blue-200' : 'text-gray-400'}`}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Message Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <input
                value={chat}
                onChange={(e) => setChat(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={connected ? "Type a message..." : "Connecting..."}
                className="border-2 border-gray-200 focus:border-blue-500 p-3 flex-1 rounded-full text-gray-800 outline-none transition-colors"
                disabled={!connected}
              />
              <button 
                onClick={sendMessage} 
                disabled={!connected || !chat.trim()}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors min-w-[48px] flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
