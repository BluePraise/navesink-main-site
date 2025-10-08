exports.handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    try {
        // Parse the form data
        const { name, email } = JSON.parse(event.body);

        // Validate input
        if (!email || !name) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Name and email are required' })
            };
        }

        // Log for debugging (remove in production)
        console.log('Attempting to subscribe:', { name, email });
        console.log('API Key exists:', !!process.env.MAILERLITE_API_KEY);
        console.log('Group ID:', process.env.MAILERLITE_GROUP_ID);

        // Call MailerLite API
        const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                fields: {
                    name: name
                },
                groups: [process.env.MAILERLITE_GROUP_ID]
            })
        });

        const result = await response.json();

        // Log the response for debugging
        console.log('MailerLite response status:', response.status);
        console.log('MailerLite response:', result);

        if (!response.ok) {
            if (response.status === 422) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        success: true,
                        message: 'You are already subscribed!'
                    })
                };
            }

            throw new Error(result.message || 'Failed to subscribe');
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                message: 'Successfully subscribed!'
            })
        };

    } catch (error) {
        console.error('Subscription error:', error);

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                error: 'Failed to subscribe. Please try again later.',
                details: error.message
            })
        };
    }
};