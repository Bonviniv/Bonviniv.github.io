import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, set, query, orderByChild } from 'firebase/database';

// Add interface at top of file
interface LeaderboardEntry {
  name: string;
  position: number;
  score: number;
}

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCU9Qg49gLZTjwkdKXCuDGNFfHT-r3TNbw",
  authDomain: "forca-a842a.firebaseapp.com",
  databaseURL: "https://forca-a842a-default-rtdb.firebaseio.com",
  projectId: "forca-a842a",
  storageBucket: "forca-a842a.firebasestorage.app",
  messagingSenderId: "193655210620",
  appId: "1:193655210620:web:d9e031a1bf40c757927ff9",
  measurementId: "G-G9WJMEKCFH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database }; 

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private db;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.db = getDatabase(app);
  }

  async getLeaderboard() {
    const leaderboardRef = ref(this.db, 'Leaderboard/ranking');
    const snapshot = await get(query(leaderboardRef, orderByChild('position')));
    if (!snapshot.exists()) return [];
    
    return Object.entries(snapshot.val())
      .map(([name, value]: [string, any]) => ({
        name,
        ...value
      }))
      .sort((a, b) => a.position - b.position);
  }

  async updateLeaderboard(playerName: string, score: number, position: number) {
    const playerRef = ref(this.db, `Leaderboard/ranking/${playerName}`);
    await set(playerRef, {
      name: playerName,
      score: score,
      position: position
    });
    
    await this.reorderLeaderboardPositions();
  }

  async reorderLeaderboardPositions() {
    const leaderboardRef = ref(this.db, 'Leaderboard/ranking');
    const snapshot = await get(leaderboardRef);
    if (!snapshot.exists()) return;
  
    // Get all players and sort by score
    const players = Object.entries(snapshot.val())
      .map(([name, data]: [string, any]) => ({
        name,
        score: data.score,
        data: data
      }))
      .sort((a, b) => b.score - a.score); // Sort by score desc
  
    // Create a new sorted leaderboard with sequential positions
    const sortedLeaderboard: { [key: string]: any } = {};
    players.forEach((player, index) => {
      sortedLeaderboard[player.name] = {
        ...player.data,
        position: index + 1 // Ensure sequential positions
      };
    });
  
    // Update entire leaderboard at once
    await set(leaderboardRef, sortedLeaderboard);
  }
}
