import mongoose from 'mongoose'

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  team: { type: String, required: true },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  tournamentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament' },
  stats: {
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    goals: { type: Number, default: 0 },
    assists: { type: Number, default: 0 }
  }
}, { timestamps: true })

const Player = mongoose.model('Player', playerSchema)
export default Player
