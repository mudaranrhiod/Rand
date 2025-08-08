document.addEventListener("astro:page-load", () => {
const id = "807170846497570848";

const lanyard = async (cb) => {

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

const avatarEl = document.getElementById("avatar-container");
avatarEl.innerHTML = `
        <img src="https://api.lanyard.rest/${id}.webp" id="avatar" class="responsive" draggable="false" alt="profile picture" />
    `;

lanyard(data => {
    const displayname = data.discord_user.display_name;
    document.getElementById("username").textContent = displayname;

    const userstatustext = data.activities.find(activities => activities.type = 4);
    document.getElementById("status-text").innerHTML = `
        <p>${userstatustext.state}</p>
    `;

    const desktopActive = data.active_on_discord_desktop;
    const embeddedActive = data.active_on_discord_embedded;
    const mobileActive = data.active_on_discord_mobile;
    const webActive = data.active_on_discord_web;
    const discordstatus = data.discord_status;

    
});
})