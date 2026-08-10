// CLEAN VERSION - Copy this to replace components/room/CreateRoom.tsx

"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";


export default function CreateRoom() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const displayName = session.user.user_metadata?.display_name || 
                          session.user.email?.split('@')[0] || '';
        setName(displayName);
      }
      setIsLoadingUser(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const displayName = session.user.user_metadata?.display_name || 
                          session.user.email?.split('@')[0] || '';
        setName(displayName);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);



  async function createRoom() {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setLoading(true);

    try {
      // Use local API route to generate room code (avoids direct Supabase fetch issues)
      const response = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: name.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      const roomCode = result.roomCode;

      setCode(roomCode);
      toast.success("Room created successfully!");
      
      // Navigate to room page — the room/[code] page will create the Supabase room_state on entry
      setTimeout(() => {
        window.location.href = `/room/${roomCode}?name=${encodeURIComponent(name.trim())}&owner=true`;
      }, 2000);
    } catch (err: any) {
      console.error('Error creating room:', err);
      toast.error(err.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  }

  if (isLoadingUser) {
    return (
      <div className="flex flex-col items-center gap-3 mt-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 mt-4">
      {/* Show signed-in status if logged in */}
      {user && (
        <div className="w-full max-w-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-3">
            {user.user_metadata?.avatar_url && (
              <img 
                src={user.user_metadata.avatar_url} 
                alt="Profile" 
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold">
                Signed in as {user.email}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        className="border-2 border-slate-600 bg-slate-700 p-3 rounded-lg w-full max-w-md text-white focus:border-blue-500 focus:outline-none"
        disabled={loading}
      />
      
      <button
        onClick={createRoom}
        disabled={loading || !name.trim()}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors w-full max-w-md font-semibold"
      >
        {loading ? "Creating..." : "Create Room"}
      </button>

      {code && (
        <div className="mt-6 p-6 bg-green-900/30 border border-green-600 rounded-lg text-center w-full max-w-md">
          <p className="text-lg font-semibold text-green-300 mb-2">
            Room Created Successfully! 🎉
          </p>
          <p className="text-3xl font-bold text-green-400 mb-2 font-mono">
            {code}
          </p>
          <p className="text-sm text-green-200 mb-4">
            Share this code with friends to join your room!
          </p>
          <button
            onClick={() => {
              navigator.clipboard.writeText(code);
              toast.success('Code copied!');
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Copy Code
          </button>
        </div>
      )}
    </div>
  );
}
