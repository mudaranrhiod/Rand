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

    

    // https://github.com/KrstlSkll69/krstlskll69.github.com/blob/efc5644a83d3c02e51f4a6eea52fdee95c73878d/Javascript/DiscordProfile.js#L967-L1054
    const webActive = data?.active_on_discord_web;
    const desktopActive = data?.active_on_discord_desktop;
    const mobileActive = data?.active_on_discord_mobile;
    const consoleActive = data?.active_on_discord_embedded;
    const discordStatus = data?.discord_status;

    const userstatustext = data.activities.find(activities => activities.type === 4);
    document.getElementById("status-text").innerHTML = `
        <p>${userstatustext.state}</p>
    `;

    const platformIndicatorContainer = document.getElementById(
        "user-status"
    );

    if (!platformIndicatorContainer) {
        console.log("Platform indicator container not found in DOM");
        return;
    }

    const rootStyles = getComputedStyle(document.body);

    const statusColors = {
    online: rootStyles.getPropertyValue('--status-online').trim(),
    idle: rootStyles.getPropertyValue('--status-idle').trim(),
    dnd: rootStyles.getPropertyValue('--status-dnd').trim(),
    offline: rootStyles.getPropertyValue('--status-offline').trim(),
    };

    const statusColor = statusColors[discordStatus] || statusColors.offline;
    let platformIconsHTML = "";

    if (webActive) {
        platformIconsHTML += `
            <i style="color:${statusColor}">public</i>
        `;
    } if (desktopActive) {
        platformIconsHTML += `
            <i style="color:${statusColor}">desktop_windows</i>
        `;
    } if (mobileActive) {
        platformIconsHTML += `
            <i style="color:${statusColor}">phone_android</i>
        `;
    } if (consoleActive) {
        platformIconsHTML += `
            <i style="color:${statusColor}">videogame_asset</i>
        `;
    } if (discordStatus === "offline") {
        platformIconsHTML += `
            <p style="color:${statusColor}">Offline</p>
        `;
    }

    platformIndicatorContainer.innerHTML = platformIconsHTML;
    platformIndicatorContainer.style.display = "flex";

    console.log("Platform indicator updated successfully");
});
})