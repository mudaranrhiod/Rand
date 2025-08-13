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

    const platformIndicatorContainer = document.getElementById("user-status");

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
    } if (data.discord_status === "offline") {
        platformIconsHTML += `
            <p style="color:${statusColor}">Offline</p>
        `;
    }
    platformIndicatorContainer.innerHTML = platformIconsHTML;
    platformIndicatorContainer.style.display = "flex";
    console.log("Platform indicator updated successfully");


    function MsToTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        if (hours > 0) {
            // show hours if it has any, idk if i followed this right
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`;
        } else {
            // only minutes and seconds
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    const presenceEl = document.getElementById("presence-data");
    presenceEl.innerHTML = '';

    data.activities.filter(activity => activity.type !== 4).forEach(activity => {
        function getImageUrl() {
            if (!activity?.assets?.large_image) return null;
            if (activity.assets.large_image.startsWith('mp:external/')) {
                return `https://media.discordapp.net/external/${activity.assets.large_image.replace('mp:external/', '')}
            `;
            } else if (activity.application_id) {
                return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png
            `;
            }
        }
        console.log(activity);
        
        const types = [ 'Playing', 'Streaming', 'Listening to', 'Watching', 'Custom' ];
        const activitytype = types[activity.type];
        const imageUrl = getImageUrl();

        let timestampsEl = '';
        function progressUpdate() {
            if ((activity.type === 2 || activity.type === 3) && activity.timestamps?.start && activity.timestamps?.end) {
            const startTime = Date.now() - activity.timestamps.start;
            const duration = activity.timestamps.end - activity.timestamps.start;
            const progress = Math.min((startTime/duration) * 100, 100);

            const startTimeFormatted = MsToTime(startTime); // mm:ss or hh:mm:ss
            const durationFormatted = MsToTime(duration);

            timestampsEl = `
                <p style="margin-left:5px"> <progress value="${progress}" max="100"></progress> ${startTimeFormatted} ${durationFormatted}</p>
            `;
            }
        }
        
        progressUpdate();
        setInterval(progressUpdate, 1000);
        
        const reviewEl = document.getElementById("reviews-container");
        reviewEl.style.marginTop = '-10px'

        presenceEl.innerHTML += `
            <article class="round" style="margin-bottom:10px;">
                <p style="margin-top:-5px; margin-left:5px">${activitytype} ${activity.name}</p>
                <div class="row">
                    <img class="round large" src="${imageUrl}" style="margin-left: 5px; height:80px; width:80px;">
                    <div class="max">
                        <p>${activity.details}</p>
                        <p>${activity.state}</p>
                    </div>
                </div>
                ${timestampsEl}
            </article>
        `
    });


});
})