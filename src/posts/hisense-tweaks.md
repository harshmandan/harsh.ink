---
title: 'Hacking my TV to clean it up'
date: '30-07-2026'
updated: '30-07-2026'
categories:
  - 'android'
excerpt: Debloating a slow Hisense Android TV over ADB, and then writing an accessibility service to fix a system menu the Apple TV remote couldn't close.
link: https://github.com/harshmandan/hisense-a4/releases/latest
source_url: https://github.com/harshmandan/hisense-a4
---

## Update: Hisense Tweaks

_July 2026_

The debloating below helped, but apps were still slow to open. So I bought an Apple TV and now use the TV mostly as a screen.

That brought a new problem. Tapping Mute three times opens a hidden "System Info" panel, and the Apple TV remote, which controls the TV's volume, sets it off easily but can't close it. I found the panel's name over ADB (`SystemSupportInfoActivity`) and wrote an accessibility service that presses Back the moment it opens.

That grew into a small app, Hisense Tweaks, which also fixes two things the debloating broke:

- **The INPUT button.** Without the Google TV launcher it did nothing. The app now shows its own input panel, styled like the stock one, on top of whatever is playing.
- **Starting on Live TV**, which doesn't work, and which I don't want to see anyway. The app switches to the Apple TV's input after boot. It takes about 15 seconds, but saves reaching for the remote.

Install the [APK](https://github.com/harshmandan/hisense-a4/releases/latest) over ADB and let it draw over other apps:

```bash
adb install -r HisenseTweaks.apk
adb shell appops set com.local.tvtweaks SYSTEM_ALERT_WINDOW allow
```

Then turn the service on from the TV itself, under Settings → System → Accessibility → Hisense Tweaks. That step can't be done over ADB.

<div class="post-divider" role="separator">Original post · July 2026</div>

My TV is a Hisense HiSmartTV A4, a 4K Android TV running Android 9 on a MediaTek chip. Over time it got really slow at opening apps. The CPU wasn't the problem; it mostly sits idle. Memory was. The TV has about 1.87 GB of RAM that apps can actually use, and the firmware fills a good chunk of it with apps I never open. So I set out to debloat it.

Everything here is done over ADB on Wi-Fi. None of it needs root.

## Getting in

The TV has USB-A ports, but they only work as hosts, for plugging things into the TV. You can't connect a computer to them for ADB, so it has to be over the network:

```bash
adb connect <TV_IP>:5555
```

To allow that, turn on Developer options (Settings → System → About, then click the build number seven times), switch on network debugging, and accept the prompt that appears on the TV. The TV forgets the connection on every reboot, so you'll be running `adb connect` a lot. Giving the TV a fixed IP address in your router saves you looking it up each time.

## Finding what was using the memory

Before removing anything, I wanted to see where the memory was going. Android can tell you how much memory is free, and which processes are holding the most of it:

```bash
adb shell cat /proc/meminfo | grep -E "MemTotal|MemFree|MemAvailable"
adb shell ps -A -o RSS,NAME | grep -E "com\.|org\." | sort -rn | head -20
```

The second command lists the 20 processes using the most memory. Very little of that list was anything I'd chosen to install. Most of it was system apps: Google's, Hisense's and MediaTek's, plenty of them running in the background whether I used them or not.

## Removing apps one at a time

There was no list of what's safe to remove on this TV, so I went through it the slow way. I'd switch off one app, use the TV for a bit, check that the inputs, the apps I use and the remote still worked, and then move on to the next one.

The usual way to switch off an app without root is `pm disable-user`:

```bash
adb shell pm disable-user --user 0 <package>
```

These went quietly, and stayed off:

- `com.google.android.tvlauncher`: the Google TV home screen. I replaced it with Projectivy Launcher.
- `com.google.android.tvrecommendations`: the recommendation rows on that home screen.
- `com.google.android.katniss`: the Google voice assistant.
- `com.google.android.tts`: text-to-speech.
- `com.google.android.tungsten.setupwraith` and `com.google.android.partnersetup`: setup apps that only matter the first time the TV is turned on.

Then I noticed some apps wouldn't stay switched off. A few of Hisense's and MediaTek's own apps came straight back, and Google Play Services switched the Play Store and Play Movies back on at every reboot. For those I used the firmer option, which removes the app for the TV's one user but keeps it on the device, so it can still be undone:

```bash
adb shell pm uninstall -k --user 0 <package>       # remove it
adb shell cmd package install-existing <package>   # undo it
```

These are the ones that needed it:

- `com.hisense.tv.smartsense`: Hisense's SmartSense.
- `com.hisense.app.logreport`: Hisense's log reporting.
- `com.mstar.netflixobserver`: a Netflix "observer" service that ships with the chip's firmware.
- `com.google.android.apps.nbu.smartconnect.tv`: Google's Smart Connect.
- `com.google.android.videos`: Play Movies.
- `com.android.vending`: the Play Store. This one turned out to be a mistake, as you'll see below.

Some apps look like bloat but aren't. The TV needs these, so leave them alone:

- `com.mediatek.wwtv.tvcenter`: switches inputs and draws the HDMI picture. If you don't want it on the home screen, hide it in the launcher instead.
- `com.hisense.tv.hitvinput` and `com.mediatek.tv.agent`: provide the HDMI inputs themselves. Without them, the TV can't show anything plugged into it.
- `com.hisense.tv.customerlauncher`, and anything with `mediatek` in its name.

I kept Google Play Services, Cast, Bluetooth, the keyboard and the TV's settings app, because I use them.

## The missing inputs

After the cleanup, Projectivy's row of inputs came up empty. The HDMI ports just weren't listed. Since it happened right after I disabled the Google TV launcher, that looked like the cause.

It wasn't. The real cause was removing the Play Store: Projectivy checks Google Play billing when it starts, and without the Store that check fails and the input list never loads. I confirmed it by putting back only the Play Store, with the Google launcher still disabled, and the inputs came back. So if you use Projectivy, keep the Play Store.

Disabling the launcher did break one thing, though: the INPUT button on the remote stopped doing anything.

## Two settings that help

Two options in Developer options also made the TV noticeably snappier:

- **Animations at 0.5×.** Setting the window, transition and animator scales to 0.5× halves the time every menu takes to slide in.
- **Background process limit at 1 or 2.** This stops Android from keeping old apps around in memory, which matters on a TV with this little of it. Don't set it to zero, though. With no background processes, even the launcher gets killed every time you leave it, and everything starts from scratch.
