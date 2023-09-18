---
title: 'Building a super small, super powerful PC'
date: '18-09-2023'
updated: '18-09-2023'
categories:
  - 'hardware'
excerpt: Putting together a small gaming PC with a Ryzen 5 5600X and an RTX 3070, in a case a little taller than a drink can.
---

![The finished PC on a desk next to a tall can of peach soda, which reaches most of the way up the case](/images/blog/sff-gaming-pc/size-vs-can.jpg)

I wanted a gaming PC small enough to pick up and carry. I was living in Bangkok at the time, and that turned out to be lucky. Back in India, PC parts were expensive and hardly anyone built small PCs, so the parts for one were close to impossible to find. In Bangkok the shops had most of what I needed. Anything they didn't have, I ordered from China.

## The easy part

A small PC means a mini-ITX motherboard. I went with the Biostar B550T-Silver. Biostar is a Taiwanese brand that's easy to find around Southeast Asia but isn't sold in India. This board has a heatsink on the M.2 slot, which is nice in a case with almost no airflow around the SSD.

For the CPU I picked the Ryzen 5 5600X. The faster chips, the 5800X and 5900X, are rated at 105 W, compared with 65 W for the 5600X. Getting rid of 105 W takes liquid cooling or a big tower cooler, and neither fits in a case this small. A low-profile cooler handles 65 W fine.

The RAM is a white PNY XLR8 kit: two 16 GB sticks, rated at 3200 MHz.

## The case

The case decides almost everything else, like how thick the graphics card and how tall the cooler can be.

I spent a long time on Alibaba looking at no-name aluminium cases, trying to find the smallest one that would still take a full-size graphics card. Plenty were tiny. But with a no-name case I'd be guessing at the build quality, and I'd only find out once everything was inside it.

I ended up with a case people already knew, the ZS-A4S V3, and found a used one on Shopee. It's a sandwich layout. The motherboard sits on one side, the graphics card on the other, and a PCIe riser cable connects the two. The first riser I bought was too long to fit, so I bought a shorter one and sold the long one.

## The 3070 that didn't fit

The first RTX 3070 I bought was too thick for the space the case leaves for the card.

![The first RTX 3070, lying on its box, with a thick heatsink that wouldn't fit in the case](/images/blog/sff-gaming-pc/first-3070.jpg)

So I sold that too. I don't speak Thai, and the buyer didn't speak English. I put the ad up on Shopee, and we had the whole conversation in Thai through Google Translate. Then we met in a public place to hand it over. It was awkward, standing there with someone I couldn't really talk to, but the sale went through.

The second 3070 was an Inno3D card, and that one fit.

![The Inno3D RTX 3070 in the case, with two Thermaltake fans mounted right above it](/images/blog/sff-gaming-pc/gpu-and-top-fans.jpg)

## The power supply

A case this size can't take a normal ATX power supply. It needs a Flex ATX one, the long, thin kind that's also called 1U. There weren't many options, and I ended up with a 550 W unit from a brand I'd never heard of. Nobody has tested its efficiency, and that comes back later.

It's modular, so you only plug in the cables you need. In this case there's nowhere to put spare ones. I also had to buy custom cables for it. They're the white ones in the photos.

## Cooling

The CPU cooler had to be low-profile. I took a while choosing one and settled on a Thermaltake low-profile air cooler. Two more Thermaltake fans sit on top of the case, right over the graphics card, where most of the heat comes from.

![The PC with the side panel off, showing the low-profile CPU cooler, the white XLR8 RAM and the white custom PSU cables](/images/blog/sff-gaming-pc/cooler-and-ram.jpg)

Under load the CPU sits around 70 °C and the GPU around 85 °C. That's warm, but it's what you get with this much hardware in this little space.

## RAM up, GPU down

Once everything was stable, I overclocked the RAM from its rated 3200 MHz to 3600 MHz. On Ryzen, the Infinity Fabric that connects the CPU's cores to the memory controller runs at a clock tied to the memory, so faster RAM speeds up the CPU too.

Then the power supply caught up with me. With things overclocked, the PC crashed every now and then. I don't trust an untested no-name unit to keep up, so I underclocked the GPU instead. It runs cooler and draws less power.

## The noise

The aluminium panels are full of small holes for airflow, and with them on, the PC makes a high-pitched noise. It was too loud to live with. I didn't find a fix. I took the panels off, and that's how it runs now, like in the photos. So the tiny case mostly sits open.

## Parts list

| Part          | What I used                                    |
| ------------- | ---------------------------------------------- |
| CPU           | AMD Ryzen 5 5600X                              |
| Motherboard   | Biostar B550T-Silver                           |
| Graphics card | Inno3D GeForce RTX 3070                        |
| RAM           | PNY XLR8 Gaming EPIC-X, 2 × 16 GB, 3200 MHz    |
| CPU cooler    | Thermaltake low-profile air cooler             |
| Case fans     | Two Thermaltake fans on top                    |
| Power supply  | No-name 550 W Flex ATX, modular, custom cables |
| Case          | ZS-A4S V3                                      |
| Riser         | PCIe riser cable                               |
