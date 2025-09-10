import express from 'express'
import cors from 'cors'
import http from 'http'
import { Server } from 'socket.io'
import biddings from './database.js'

const app = express()
const PORT = 3000

app.use(cors())
app.use(express.json())

// WebSocket Configuration
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "https://bidnow-three.vercel.app/",
        methods: ["GET", "POST"]
    }
})

// Routes
// Place bid
app.post('/placebid', (req, res) => {
    const { user, bid, product_name } = req.body

    const newBid = {
        id: Date.now(),
        name: user,
        bid,
        product_name,
    }

    biddings.push(newBid)

    io.emit("bidPlaced", newBid)
    res.json({ success: true, bid: newBid })
})

// Highest bid
app.get('/highestbid', (req, res) => {
    const sorted = [...biddings].sort((a, b) => b.bid - a.bid)
    res.json(sorted)
})

// Last bids
app.get('/lastbids', (req, res) => {
    const sorted = [...biddings].sort((a, b) => b.id - a.id)
    res.json(sorted)
})

// User bids
app.get('/user-bids/:username', (req, res) => {
    const { username } = req.params
    const userBids = biddings.filter(b => b.name === username)
    res.json(userBids.map(b => b.product_name))
})

io.on("connection", (socket) => {
    console.log("User connected:", socket.id)

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id)
    })
})

server.listen(PORT, () => {
    console.log("Server is running on Port : ", PORT)
})
