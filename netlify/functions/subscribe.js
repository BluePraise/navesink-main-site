exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { name, email } = JSON.parse(event.body);

        if (!email || !name) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Name and email are required' })
            };
        }

        const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                fields: { name: name },
                groups: [process.env.MAILERLITE_GROUP_ID]
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Failed to subscribe');
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true })
        };

    } catch (error) {
        console.error('Subscription error:', error);

        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to subscribe' })
        };
    }
};