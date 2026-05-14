---
title: 'Reverse-engineering the Cardi Tech BLE protocol'
date: '14-05-2026'
updated: '17-11-2026'
categories:
  - 'reverse-engineering'
excerpt: The official app for my car's ambient lighting kit doesn't connect, so I reverse-engineered its Bluetooth protocol and built my own. Then I spent three more days on bugs that only showed up after I thought I was done.
link: https://opencardi.harsh.ink
source_url: https://github.com/harshmandan/open-cardi
---

## Update: a native Android app

_October 2026_

open-cardi is now a native Android app as well, with an Android Auto screen, and that's the version I'd recommend. The APK is on the [releases page](https://github.com/harshmandan/open-cardi/releases). The web app is still online at [opencardi.harsh.ink](https://opencardi.harsh.ink), but there's a problem with it that a web page can't fix.

I found out the hard way. While I was changing colours from the web app, the lights went into a state I couldn't get out of. The kit stopped responding to anything, and my phone couldn't even connect to it any more. In the end I had to reset it physically, using the controls on the controller itself. Nothing else worked.

Here's what was going on. With the ignition on and the headlamps set to AUTO, the kit sometimes resets itself when colours change, whichever app is driving it, including the vendor's. Most likely that's the installer's power wiring, not the protocol. Normally it doesn't matter: the kit blanks for a moment and comes back with its last colour about half a second later.

What decides whether it comes back is the size of the Bluetooth packets. When a phone connects, the two sides agree on a maximum packet size, called the ATT MTU. The vendor app keeps the default of 23 bytes. Chrome asks for the largest size, 517, on every Web Bluetooth connection, and the kit agrees to 131. After a reset at 131, the kit stays stuck blinking instead of recovering.

To confirm it, I built the Android app with a switch for the packet size and ran the same test both ways. At 23, the kit recovered from every reset. At 131, it locked up within six seconds. And a web page has no way to ask Chrome for a smaller packet size: the Web Bluetooth spec has no setting for it ([a proposal to add one](https://github.com/whatwg/bluetooth/issues/284) was closed in 2016), so the web app can't avoid it.

The Android app connects the way the vendor app does, with the default packet size. It also reconnects on its own when the kit resets, lists nearby kits by name so you can pick yours, and has a factory reset and a lock code that I found in a newer version of the vendor app, Cardi-RGBW 1.2.2. More on those in [the open bugs section](#open-bugs) at the end.

<img class="screenshot" src="/images/blog/reverse-engineering-cardi-tech/android-app.webp" alt="The open-cardi Android app on the Light Guide zone: a grid of colour swatches, a brightness slider at 82%, and a large power button" loading="lazy" />

<img class="recording" src="/images/blog/reverse-engineering-cardi-tech/android-auto.webp" alt="open-cardi on the car's dashboard screen through Android Auto: power, settings, microphone, Bluetooth and gear buttons on the left, Overall, Light Guide and Floor zones, a grid of colour swatches with purple selected, and a brightness slider at 82%, with the blue light-guide strip glowing below the screen" loading="lazy" />

<div class="post-divider" role="separator">Original post · May 2026</div>

The official Cardi Tech app doesn't connect. I tried three Android phones and the iOS version on an iPhone, and nothing ever paired. I eventually found an older APK that _does_ pair, but only sometimes, and once it's connected it stops sending changes after about a minute. So I reverse-engineered the Bluetooth protocol and built [open-cardi](https://github.com/harshmandan/open-cardi), a SvelteKit web app that talks to the kit over Web Bluetooth. It's at [opencardi.harsh.ink](https://opencardi.harsh.ink) and works in Chrome on Android, Windows, macOS and Linux.

![The car's dashboard with the light-guide strip glowing blue under the air vents](/images/blog/reverse-engineering-cardi-tech/dash-light-guide.webp)

## The kit, the apps, the mess

A few months ago I bought a Cardi K3 Active Ultra: nine LED strips, ₹3,500 for the kit and ₹1,500 to install it. The hardware is genuinely good.

The software is a mess. The vendor ships at least eight apps that are the same app under different brands: Caroxygen, Carhatke, Drivestylish, CarConcepts, Cardi Auto and more. I tried the current versions of the relevant ones on three Android phones and an iPhone. None of them paired. The app would find the device, the connect button would spin, and then either nothing happened or it showed an error in Chinese and gave up.

Eventually I dug up an older APK of "Cardi Tech" (`com.qc.xq` v1.20) that _did_ pair, sort of. Sometimes you'd connect and the sliders would do nothing. Sometimes it worked for a minute and then stopped sending changes until you killed the app and reopened it. Sometimes Bluetooth itself needed turning off and on. The UI looks like years of features were added and nothing was ever removed: duplicate sliders, settings three sheets deep, and a toggle in the top bar labelled "MTX" that turned out to switch between Classic and Starlight.

So the only app that works is also broken, just less broken. That was enough to capture packets from, which is all I needed.

These kits are everywhere in India, too. Any car accessories shop in Delhi or Bangalore has them on the shelf. A lot of people own one, the official software is broken, and the protocol underneath has no security at all. It was a good thing to take apart.

## The plan

The kit talks to the phone over Bluetooth Low Energy. Somewhere on the device is a characteristic you can write bytes to, and somewhere in the app is the code that builds those bytes. To replace the app, I needed to know exactly which bytes go where, and in what order. There are three ways to find that out, and I used all of them:

1. **nRF Connect.** Scan for the controller and list everything it exposes over Bluetooth.
2. **HCI snoop logs and Wireshark.** Turn on Android's built-in Bluetooth capture, use the working app in a planned sequence, and read every byte it sent.
3. **Decompiling the APK with jadx and apktool.** Turn the app back into readable Java and resources, and find every command it _can_ send, including ones I never triggered.

Each one shows something the others don't. The first shows what the device exposes. The second shows the exact bytes the app sends for actions I know. The third shows the full list of commands and what each one does. Together they got me from "this controller exists" to "I can write a replacement app" in a weekend.

## Step 1: nRF Connect and the GATT map

Bluetooth Low Energy devices describe themselves with GATT, the Generic Attribute Profile. The device, here the controller wired into the car, exposes a tree of _services_. Each service has _characteristics_, and each characteristic has a UUID and a set of properties, like READ, WRITE, WRITE_NO_RESPONSE and NOTIFY. Any phone can connect and read that tree without the vendor's help.

[nRF Connect](https://www.nordicsemi.com/Products/Development-tools/nRF-Connect-for-mobile) is Nordic Semiconductor's free Bluetooth tool. It scans for nearby devices, and it can connect to one and list its whole GATT tree.

The scan found a device advertising as `CarDiLits`, with service `0xFFF0`. That UUID isn't assigned to anyone by the Bluetooth SIG, but cheap Bluetooth chips use it all the time for their own custom service, so it already hinted at a homemade protocol. I connected and got this:

| Service            | UUID         | What it is                                    |
| ------------------ | ------------ | --------------------------------------------- |
| Generic Access     | `0x1800`     | Standard: name and appearance                 |
| Generic Attribute  | `0x1801`     | Standard: service-change notifications        |
| **Vendor service** | **`0xFFF0`** | The one we want                               |
| Device Information | `0x180A`     | Manufacturer, model and firmware strings      |
| Battery Service    | `0x180F`     | Exposed but unused, since the kit is wired in |
| TI-style OAD       | `f000ffc0-…` | Firmware updates. **Don't write here.**       |

Inside `0xFFF0`, two characteristics mattered:

- `0xFFE2`, **WRITE NO RESPONSE**. Commands go here. "No response" means the phone sends the write and moves on, without waiting for the controller to confirm it. That matters later, because Web Bluetooth still queues these writes on the phone's side.
- `0xFFE1`, **NOTIFY and READ**. Replies come back here. Subscribe to it and the controller sends updates as things change.

The Device Information service is a standard one that reports the manufacturer, model and firmware. The Cardi controller reported this:

```
Manufacturer Name : BEKEN SAS
Model Number      : BK-BLE-1.0
Firmware Revision : 6.1.2
System ID         : 12-34-56-FF-FE-9A-BC-DE   ← SDK placeholder
Cert Data         : FF-EE-DD-CC-BB-AA          ← SDK placeholder
PnP ID            : Vendor 0x45E (Microsoft)   ← SDK placeholder, lol
```

That's three default values from the chip maker's SDK that nobody changed. It points to a Beken BK3431 or BK3432 chip running Beken's example Bluetooth firmware, with LED control added on top. The TI-style firmware update service fits too, since Beken's SDK appears to borrow from TI's CC2540 reference code. Nobody ships `12-34-56-FF-FE-9A-BC-DE` as a System ID on purpose.

That was useful before I'd sent a single byte. Beken's example firmware has no pairing, no encryption and no authentication. Whatever the vendor built on top of `0xFFE2` and `0xFFE1` was the only thing between any phone and the lights.

To rule out the common LED controller protocols, I sent the standard "set red" command for each of the three usual ones to `0xFFE2`, straight from nRF Connect:

```
ELK-BLEDOM:    7E 00 05 03 FF 00 00 00 EF
LEDnet:        56 FF 00 00 00 F0 AA
Triones:       CC 23 33
```

Nothing reacted. It was a custom protocol, so it was time to capture some traffic.

## Step 2: HCI snoop logs and Wireshark

The fastest way to learn a custom binary protocol is to record what the working app sends and read the bytes. Android has a tool for exactly this: the HCI snoop log.

HCI, the Host Controller Interface, sits between Android's Bluetooth stack and the Bluetooth chip. Everything that crosses it is an HCI packet, including the writes the app sends to the controller. With the snoop log turned on, Android saves every packet to a log file that Wireshark can read.

To turn it on:

1. Go to Settings → Developer Options → **Enable Bluetooth HCI snoop log**.
2. Turn Bluetooth off and on again, so it starts writing the file.
3. Use the app you want to capture.
4. Get the log off the phone. On newer Android versions you can't copy it directly, but `adb bugreport` saves a zip with the log inside.

The tools are the easy part. The hard part is planning what you do in the app, so each action shows up as its own separate cluster of bytes. My session went like this: open Cardi Tech and let it connect. Wait. Turn the lights on, wait three seconds, turn them off, wait three seconds. Set red, pause, set green, pause, set blue, pause. Switch zone and set red, then switch zone and set red again. Move the brightness slider to 100, 50 and 0. The pauses are what make the capture readable later, because each gap separates two actions I know.

Then I filtered it with `tshark`, Wireshark's command-line version. The writes I cared about use ATT opcode `0x52`, a Write Command, which doesn't wait for a reply. The other write opcode, `0x12`, wasn't used at all. Wireshark identifies characteristics by _handle_, a number the device assigns, rather than by UUID. On this controller, `0xFFE2` was handle `0x0010`:

```bash
tshark -r session.log \
  -Y 'btatt.opcode == 0x52 && btatt.handle == 0x0010' \
  -T fields -e frame.time_relative -e btatt.value
```

The first time you run that on a clean capture and watch 30 seconds of tapping turn into a few lines of bytes, you see why people like Wireshark.

```
73.773  edf0000000e9   ← I just turned the lights ON
74.793  ed0f000000e9   ← and OFF
83.473  ed49ff0000e9   ← obviously a colour (I just set red)
84.526  ed49db0000e9
84.540  ed49d60000e9
```

You can see the format from those few lines. Every command is 6 bytes, `ED <op> <a> <b> <c> E9`. `ED` and `E9` mark the start and end, and there's no checksum or length field. `ED 49 FF 00 00 E9` showed up right after I set red, so opcode `0x49` sets a colour, as plain RGB. Twenty minutes after turning on the snoop log, I had the colour command.

### Diffing bytes to find the zone selector

Zones came from a trick that's obvious once you've seen it: **send the same colour to different zones and compare the bytes.** Switch zone, set red. Switch zone, set red. Whatever changes between the "reds" is the zone. Whatever stays the same is the colour. You don't need to know anything about the protocol first.

The answer showed up straight away. Every zone change sent one 3-byte frame, `FE XX EF`, where `XX` was the zone. The colour writes after it were identical. So the controller remembers which zone is selected: send the zone frame, and every colour or pattern command after it applies to that zone until you switch again.

## Step 3: Decompiling the APK

A capture only shows what the app did during that session, not everything it can do. To find the full list of commands, including features I never used, I had to read the app's source. It isn't public, so I decompiled it.

An APK is a ZIP file. Inside are `classes.dex`, the app's compiled code; `resources.arsc`, a table that maps numeric IDs to strings, layouts and images; a binary `AndroidManifest.xml`; and any other assets. Each needs its own tool to turn back into something readable:

```bash
brew install jadx apktool
jadx --no-res -d ./decompiled cardi-tech.apk      # bytecode  → pseudo-Java
apktool d -f -o ./extracted cardi-tech.apk        # resources → XML
```

[jadx](https://github.com/skylot/jadx) turns `classes.dex` back into Java. It isn't the original source: local variables get names like `p0` and `var2`, and some control flow is guessed. But it's readable. If the vendor had obfuscated the code properly, every class would be called something like `a.a.b.c`, and it would have been a slog. They barely did. The Bluetooth code is in a class called `MyBluetoothGatt`.

[apktool](https://apktool.org/) handles the other half. The Java code refers to resources by number, so `R.string.new_mod1` becomes `0x7f120295`. apktool turns `resources.arsc` back into files like `res/values/strings.xml`, so you can map those numbers to the actual labels, like "Overall", "Light Guide" and "Floor". You need both: jadx gives you the code, and apktool gives you the labels.

Matching the two up is where Claude Code, running Claude Opus 4.7, was worth it. There were 678 Java files, a Bluetooth class over 1,100 lines long, and thousands of strings. Following each method from `setX(int i)` to `findViewById(R.id.…)` to the layout to the string is tedious, and I didn't want to do it by hand. I gave Claude Code the folder and asked it to map every method that builds bytes to its label in the UI. It did the same search-and-read loop I would have, just faster, and I made the decisions.

That gave me the full list of commands in one pass. The most useful find wasn't a command, though. It was this line, which decides which devices the app will connect to:

```java
public static final String COMPANY_NAME =
    "^iLits|^CarDiLits|^BaoYin|^CaChuang|^CarL|^MTF-LIGHT|^AIKON-LIT";
```

The same firmware ships under at least seven brand names, plus `Dream` and `Flash` variants elsewhere in the code. _Reverse-engineering one of these means reverse-engineering all of them._ So open-cardi finds kits by the `0xFFF0` service first, and only falls back to the name. That's why it works with every one of these brands, not just the Cardi K3.

## Step 4: Testing on the real kit

A protocol decoded from captures and decompiled code is still only a guess until you send those bytes to the real hardware and watch what happens.

I wrote a [small Python script](https://github.com/harshmandan/open-cardi/blob/main/debug/open-cardi.py) with [Bleak](https://bleak.readthedocs.io/) that I could type commands into. It's one file, with inline script metadata (PEP 723) at the top:

```python
#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["bleak>=0.22"]
# ///
```

With that header, [uv](https://docs.astral.sh/uv/) installs Bleak the first time you run the script, so it works on a clean machine with no `pip install` and no virtual environment. It's my favourite thing to happen to Python scripts in years.

It takes short commands like `red`, `z floor`, `p 21`, `speed 80` and `raw ed49ff0000e9`, turns each one into bytes, and sends them to the kit. Each try took less than a second.

About the "lab": most of the testing happened in the car, in the driveway, in May, in Delhi. It's about 41°C right now, and the car's AC loses to direct sun by about 4°C. So you either test at 7am, or after sunset, or you sweat through a t-shirt watching a hex dump scroll. I picked the third more often than I should have.

![A laptop on the passenger side, running the pattern tests in a terminal, with the dashboard's light strip lit purple behind it](/images/blog/reverse-engineering-cardi-tech/testing-in-the-car.webp)

_The testing setup in the driveway. Don't mind the dirty laptop screen._

The script confirmed the whole protocol in an afternoon. The less obvious findings:

- **The K3 has no separate Doors zone.** `FE 03 EF` does nothing. Light Guide (`FE 02 EF`) drives the front strip _and_ all four door strips together.
- **Pattern brightness (`31 N 13`) is ignored on the K3.** It's probably a K4 feature.
- **The warm-white channel (`C3 N 3C`) is ignored too.** The K3 has no white LED, only RGB.
- **Patterns are per zone.** Each zone can run its own pattern or solid colour.
- **The connection drops after about 10 seconds idle.** Either send something to keep it alive, or reconnect when you need it.

One false alarm worth mentioning: twice, I blamed the protocol for something that turned out to be **the car's power wiring**. The door strips in my car are powered through the window-switch circuit, which turns off when accessory power times out. "The doors went off after I sent X" looked like a software bug. It was the engine having been off for two minutes. No amount of decompiling would have found that one.

## I thought I was done. Then I built the UI.

The protocol was worked out, the script could drive every feature, and the code that builds each command ported to TypeScript almost line for line. I opened the SvelteKit project expecting to just wire things up.

It took three more days of bugs, and none of them were in the protocol.

### The GATT queue pile-up

First build. Drag the hue slider. The lights follow for half a second, then freeze, then the connection drops.

```
DOMException: GATT operation in progress.
DOMException: GATT operation in progress.
DOMException: GATT operation in progress.
```

`writeValueWithoutResponse` doesn't wait for the device, but Chrome still won't start a new write while the last one is in progress. Call it again too soon and the new write is rejected. Dragging a slider fires about 60 events a second, so this started happening almost immediately.

The fix has two parts. First, chain every write onto the one before it, so they never overlap:

```typescript
// Before: writes overlap and get rejected
await this.writeChar.writeValueWithoutResponse(bytes);

// After: each write waits for the previous one
this.writeTail = this.writeTail
	.then(() => this.writeChar.writeValueWithoutResponse(bytes))
	.catch((e) => this.logError(e));
```

Second, chaining alone isn't enough. If 60 slider events queue up, you wait for all 60 writes before you see the colour you stopped on. So the controls only keep the latest value of each kind and drop the rest:

```
Slider drag fires:      red → red-orange → orange → yellow → ...
Without dropping:       60 writes queued, all out of date by the time they're sent
With latest-only:       1 write queued, always the current colour
```

That took dragging from "freezes the kit" to instant.

### The 10 Hz wall

That fixed the browser side, but the kit still dropped into a white strobe it wouldn't respond to, about once a minute when I used the sliders hard. There was no error in the console, and the writes were succeeding.

To find it, I added a log to the app that records the last 2,000 things sent to and from the kit, with a button to download it. Five minutes of abusing the sliders, save the log, and look for the moment the strobe started.

The bytes were right. They were just arriving too fast, or so I thought. The official app waits 150ms between writes, and my queue was sending about 30 writes a second on Android Chrome. So I added a minimum gap:

```typescript
const MIN_INTERVAL_MS = 100; // the vendor app waits 150ms
const elapsed = performance.now() - this.lastSentAt;
if (elapsed < MIN_INTERVAL_MS) {
	await sleep(MIN_INTERVAL_MS - elapsed);
}
```

The first version only slowed down colour writes. Then the strobe came back when I turned the lights off while dragging a slider, so I applied the gap to every write.

_Update, October 2026: the throttle didn't cause or fix the white strobe. The real cause was the kit resetting while Chrome's larger packet size was in use, as the update at the top explains. The newer vendor app doesn't throttle at all, and the kit copes fine._

### The brightness floor I was wrong about

This one's embarrassing.

The web app has an SVG preview of the car interior, drawn from above in whatever colour and brightness you pick. It looked fine at my desk. Then I tried 5% brightness sitting in the car. In real life, 5% is dim but clearly on. In the preview, 5% looked black.

So I "fixed" it by clamping the brightness sent to the kit to 50–100, while the slider still said 0–100%. Drag to 0, and it actually sent 50. The preview stayed visible. Problem solved!

Except now the slider said 0 when it wasn't. The kit looks fine at single-digit brightness in real life. The preview was wrong, not the lights, and I'd fixed the wrong thing.

I undid it the next day:

```typescript
// Before: clamp what's sent to the kit, to make up for the preview
function brightnessForWire(uiValue: number): number {
	return 50 + (uiValue * 50) / 100; // the real kit never goes below 50%, oops
}

// After: send what the user picked, and fix the preview instead
function brightnessForWire(uiValue: number): number {
	return uiValue;
}

// In the preview: only the SVG's opacity is remapped
const previewOpacity = 0.5 + (brightness / 100) * 0.5;
```

The lesson: if the preview disagrees with the real thing, fix the preview, and never change what you send to the device to make up for a UI bug.

### Zone state lags the user

The controller remembers which zone was selected, even across disconnects. So after a fresh page load, the first colour you send goes to _whichever zone the last session left selected_. In my car that was usually Floor. You'd open the app, tap Light Guide, drag the colour picker, and watch the footwells change instead of the dash. The fix is one line at the end of connecting: send the zone the UI is showing, before anything else.

<img class="recording" src="/images/blog/reverse-engineering-cardi-tech/web-app.webp" alt="The open-cardi web app: dragging the colour slider changes the lights in the car preview from red to green to orange and back to red" loading="lazy" />

## Try it

If you have a Cardi K3 or K4, or one of the same kits under another brand (iLits, BaoYin, CaChuang, CarL, MTF-LIGHT, AIKON-LIT, Dream or Flash), it should work:

→ **The Android app.** Download the APK from the [releases page](https://github.com/harshmandan/open-cardi/releases). This is the one to use; see the update at the top.

→ **[opencardi.harsh.ink](https://opencardi.harsh.ink), the web app.** Open it in Chrome, click Connect, and install it as a PWA if you like. On iOS, open it in [Bluefy](https://apps.apple.com/us/app/bluefy-web-ble-browser/id1492822055), since Safari and iOS Chrome don't support Web Bluetooth. Use it at your own risk: it can lock the kit, as described at the top.

If your kit uses a different name and doesn't show up in the list, the [Python script](https://github.com/harshmandan/open-cardi/blob/main/debug/open-cardi.py) can find it anyway and check whether the protocol matches. Open an issue with the device name and I'll add it.

The source and the full protocol, in much more detail than this post, are on [GitHub](https://github.com/harshmandan/open-cardi). It's MIT licensed.

<h2 id="open-bugs">Open bugs</h2>

This list was written in May. Where things stand as of October:

- **White-strobe stuck mode.** Solved, as far as the cause goes: the kit resets on its own, and Chrome's larger Bluetooth packet size stops it from recovering. The details are in the update at the top. My May guess, an AES challenge in the old SDK, was wrong. A newer version of the vendor app, Cardi-RGBW 1.2.2, has no encryption at all, and it doesn't throttle writes either.
- **Can't reconnect after stuck mode.** The same issue. Once the kit is locked, it stops advertising, so there's nothing to find until it's reset.
- **Cross-car flicker.** Cardi-RGBW 1.2.2 has a "lock code": a colour followed by five quick off/on pairs, 200 ms apart. In similar Chinese lighting kits, that pairs a controller to its lights so they stop following other controllers nearby, which would explain the flicker. Both apps can now send it, but I haven't parked next to another Cardi car to confirm it works.
- **Music sync from the web app.** Still not built. The kit's own microphone mode works fine. Using the phone's microphone instead would mean listening in the browser and sending a new colour several times a second.
- **Factory reset.** Found it: Cardi-RGBW 1.2.2 sends `F1 F2 F3 F4 F5 F6`. Both apps can send it now. It needs a working connection, though, so it can't rescue a kit that's already locked.

If you own one of these kits and want to help with any of the above, the app's log (under More → Save) downloads as a text file you can attach to a GitHub issue.
