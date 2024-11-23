let globalStartTime = null; // Global start time for all users
let running = false; // Whether the timer is running globally
let clients = {}; // Store each user's independent stop time

export default function handler(req, res) {
    const { clientId } = req.query; // Unique clientId for each user

    if (!clientId) {
        return res.status(400).json({ error: 'clientId is required' });
    }

    // Initialize each client's state if it doesn't exist
    if (!clients[clientId]) {
        clients[clientId] = {
            stopTime: null, // Independent stop time for this user
        };
    }

    if (req.method === 'POST') {
        const { type } = req.body;

        if (type === 'start') {
            if (!running) { // Only set the start time if the timer is not already running
                globalStartTime = Date.now();
                running = true;
                console.log(`[START] Timer started globally at ${globalStartTime}`);
            }
            return res.status(200).json({ startTime: globalStartTime });
        }
        

        if (type === 'stop') {
            if (running) {
                clients[clientId].stopTime = Date.now() - globalStartTime; // Calculate stop time for this user
                console.log(`[STOP] Client ${clientId} stopped their timer at ${clients[clientId].stopTime}ms`);
            }
        
            // Do not set `running = false` here, as other users might still be running the timer
            return res.status(200).json({ stopTime: clients[clientId].stopTime });
        }
        

        if (type === 'reset') {
            globalStartTime = null;
            running = false;
            Object.keys(clients).forEach((id) => {
                clients[id].stopTime = null; // Reset all stop times
            });

            console.log(`[RESET] Timer reset globally.`);
            return res.status(200).json({ reset: true });
        }

        return res.status(400).json({ error: 'Invalid action' });
    }

    if (req.method === 'GET') {
        // Return the global timer state and individual stop time for the specific client
        return res.status(200).json({
            startTime: globalStartTime,
            stopTime: clients[clientId].stopTime,
            running: running, // Whether the timer is running globally
        });
    }

    res.status(405).json({ error: 'Method not allowed' });
}
