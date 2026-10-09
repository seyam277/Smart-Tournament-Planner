import mongoose from 'mongoose'

const matchSchema = new mongoose.Schema({
  matchNumber: String,
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  team1Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  team2Id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  team1Name: String,
  team2Name: String,
  matchDate: String,
  matchTime: String,
  venue: String,
  status: { type: String, enum: ['Scheduled', 'Live', 'Completed'], default: 'Scheduled' },
  score1: { type: Number, default: 0 },
  score2: { type: Number, default: 0 },
  score1Full: String, // For cricket like "150/5 (20 ov)"
  score2Full: String,
  resultSummary: String,
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  winnerName: String,
  manOfTheMatch: String,
  playerPerformances: [{
    playerName: String,
    teamName: String,
    goals: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    points: { type: Number, default: 0 }
  }]
}, { timestamps: true })

const Match = mongoose.model('Match', matchSchema)
export default Match
