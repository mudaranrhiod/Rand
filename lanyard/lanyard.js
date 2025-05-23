const id = "807170846497570848";

const lanyard = async (cb) => {
    const req = await fetch(`https://api.lanyard.rest/v1/users/${id}`);

    const data = await req.json();

    if (req.ok && data.success) {
        await cb(data.data);
    }

    const ws = new WebSocket("wss://lanyard.atums.world/socket");

    ws.onmessage = async ({ data }) => {
        data = JSON.parse(data);

        switch (data.op) {
            case 0: {
                await cb(data.d);
                break;
            }
            case 1: {
                ws.send(
                    JSON.stringify({
                        op: 2,
                        d: {
                            subscribe_to_id: id,
                        },
                    }),
                );
                setInterval(() => {
                    ws.send(
                        JSON.stringify({
                            op: 3,
                        }),
                    );
                }, data.d.heartbeat_interval - 1000);
                break;
            }
        }
    }
}
lanyard(console.log)