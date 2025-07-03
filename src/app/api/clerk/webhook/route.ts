import { getDb } from "~/server/db"

export const POST  = async(req: Request) => {
    try {
        const db = await getDb();
        const { data } = await req.json();
        console.log('clerk webhook received', { id: data?.id });

        if (!data || !data.id || !data.email_addresses || !Array.isArray(data.email_addresses) || !data.email_addresses[0]?.email_address) {
            return new Response('Invalid webhook payload', { status: 400 });
        }

        const emailAddress = data.email_addresses[0].email_address;
        const firstName = data.first_name || '';
        const lastName = data.last_name || '';
        const imageUrl = data.image_url || '';
        const id = data.id;

        const existingUser = await db.user.findUnique({ where: { id } });
        if (existingUser) {
            return new Response('User already exists', { status: 200 });
        }

        await db.user.create({
            data: {
                id: id,
                emailAddress: emailAddress,
                firstName: firstName,
                lastName: lastName,
                imageUrl: imageUrl,
            }
        });

        return new Response('Webhook received', { status: 200 });
    } catch (error) {
        console.error('Error in Clerk webhook:', error);
        return new Response('Internal server error', { status: 500 });
    }
}