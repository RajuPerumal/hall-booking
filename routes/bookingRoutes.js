const express = require("express");
const router = express.Router();
const { rooms, bookings } = require("../data/hallData");

// 1. Create a Room
router.post("/rooms", (req, res) => {
    const { roomName, seatsAvailable, amenities, pricePerHour } = req.body;

    if (!roomName || !seatsAvailable || !amenities || !pricePerHour) {
        return res.status(400).json({ message: "All fields are required." });
    }

    const room = { id: rooms.length + 1, roomName, seatsAvailable, amenities, pricePerHour };
    rooms.push(room);
    res.status(201).json({ message: "Room created successfully.", room });
});

// 2. Book a Room
router.post("/bookings", (req, res) => {
    const { customerName, roomId, date, startTime, endTime } = req.body;

    if (!customerName || !roomId || !date || !startTime || !endTime) {
        return res.status(400).json({ message: "All fields are required." });
    }

    // Check if room exists
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return res.status(404).json({ message: "Room not found." });

    // Check for booking conflicts
    const conflict = bookings.some(
        (b) =>
            b.roomId === roomId &&
            b.date === date &&
            ((startTime >= b.startTime && startTime < b.endTime) ||
                (endTime > b.startTime && endTime <= b.endTime))
    );
    if (conflict) return res.status(400).json({ message: "Room is already booked for this time." });

    const booking = {
        id: bookings.length + 1,
        customerName,
        roomId,
        date,
        startTime,
        endTime,
    };
    bookings.push(booking);
    res.status(201).json({ message: "Room booked successfully.", booking });
});

// 3. List all Rooms with Booked Data
router.get("/rooms", (req, res) => {
    const roomsWithBookings = rooms.map((room) => {
        const roomBookings = bookings.filter((b) => b.roomId === room.id);
        return { ...room, bookings: roomBookings };
    });
    res.json(roomsWithBookings);
});

// 4. List all Customers with their Booked Data
router.get("/customers", (req, res) => {
    const customerBookings = bookings.map((booking) => {
        const room = rooms.find((r) => r.id === booking.roomId);
        return {
            customerName: booking.customerName,
            roomName: room.roomName,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
        };
    });
    res.json(customerBookings);
});

// 5. List how many times a Customer has booked rooms
router.get("/customers/:name", (req, res) => {
    const { name } = req.params;
    const customerRecords = bookings
        .filter((b) => b.customerName === name)
        .map((b) => {
            const room = rooms.find((r) => r.id === b.roomId);
            return {
                customerName: b.customerName,
                roomName: room.roomName,
                date: b.date,
                startTime: b.startTime,
                endTime: b.endTime,
                bookingId: b.id,
            };
        });

    const totalBookings = customerRecords.length;
    res.json({ totalBookings, records: customerRecords });
});

module.exports = router;
