const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const User = require('../models/User');

// ADD TRIP
router.post('/add-trip', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/users/login');
  }

  try {
    const userId = req.user._id;
    const { trip_name, trip_date, destination } = req.body;

    if (!trip_name || !trip_date || !destination) {
      return res.render('index', {
        title: 'Add Trip',
        user: req.user,
        error: 'Please provide all required fields: Trip Name, Trip Date, and Destination.',
        success: null,
      });
    }

    const newTrip = new Trip({
      user: userId,
      tripName: trip_name,
      tripDate: new Date(trip_date),
      destination,
    });

    await newTrip.save();

    res.redirect('/trips/view-trips');
  } catch (err) {
    console.log(err);
    res.status(500).render('index', {
      title: 'Add Trip',
      user: req.user,
      error: 'Something went wrong while adding your trip.',
      success: null,
    });
  }
});

// VIEW ALL TRIPS
router.get('/view-trips', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/users/login');
  }

  try {
    const userId = req.user._id;
    const trips = await Trip.find({ user: userId }).sort({ tripDate: -1 });
    const formattedTrips = trips.map(trip => {
      return {
        ...trip.toObject(),
        tripDate: trip.tripDate.toLocaleDateString('en-US')
      };
    });

    res.render('trips/trips', {
      title: 'Your Trips',
      user: req.user.username,
      trips: formattedTrips,
    });
  } catch (err) {
    console.log(err);
    res.status(500).render('index', {
      title: 'View Trips',
      user: req.user.username,
      error: 'Could not load your trips. Please try again later.',
      success: null,
    });
  }
});

// EDIT TRIP
router.get('/edit-trip/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/users/login');
  }

  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).render('index', {
        title: 'Edit Trip',
        user: req.user,
        error: 'Trip not found.',
        success: null,
      });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).render('index', {
        title: 'Edit Trip',
        user: req.user,
        error: 'You are not authorized to edit this trip.',
        success: null,
      });
    }

    const formattedTripDate = trip.tripDate.toISOString().slice(0, 10);
    res.render('trips/edit-trip', {
      title: 'Edit Trip',
      user: req.user,
      trip: trip.toObject(),
      tripDate: formattedTripDate,
    });

  } catch (err) {
    console.log(err);
    res.status(500).render('index', {
      title: 'Edit Trip',
      user: req.user,
      error: 'Something went wrong while fetching the trip.',
      success: null,
    });
  }
});

// UPDATE TRIP
router.post('/edit-trip/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/users/login');
  }

  try {
    const { trip_name, trip_date, destination } = req.body;

    if (!trip_name || !trip_date || !destination) {
      return res.render('trips/edit-trip', {
        title: 'Edit Trip',
        user: req.user,
        trip: { ...req.body, _id: req.params.id },
        error: 'Please provide all required fields: Trip Name, Trip Date, and Destination.',
        success: null,
      });
    }

    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).render('index', {
        title: 'Edit Trip',
        user: req.user,
        error: 'Trip not found.',
        success: null,
      });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).render('index', {
        title: 'Edit Trip',
        user: req.user,
        error: 'You are not authorized to edit this trip.',
        success: null,
      });
    }

    // Update the trip details
    trip.tripName = trip_name;
    trip.destination = destination;
    trip.tripDate = new Date(trip_date);

    await trip.save();
    res.redirect('/trips/view-trips');

  } catch (err) {
    console.log(err);
    res.status(500).render('index', {
      title: 'Edit Trip',
      user: req.user,
      error: 'Something went wrong while updating your trip.',
      success: null,
    });
  }
});

// DELETE TRIP
router.post('/delete-trip/:id', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/users/login');
  }

  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).render('index', {
        title: 'Delete Trip',
        user: req.user,
        error: 'Trip not found.',
        success: null,
      });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).render('index', {
        title: 'Delete Trip',
        user: req.user,
        error: 'You are not authorized to delete this trip.',
        success: null,
      });
    }

    await Trip.deleteOne({ _id: req.params.id });
    res.redirect('/trips/view-trips');
    
  } catch (err) {
    console.log(err);
    res.status(500).render('index', {
      title: 'Delete Trip',
      user: req.user,
      error: 'Something went wrong while deleting your trip.',
      success: null,
    });
  }
});

module.exports = router;
