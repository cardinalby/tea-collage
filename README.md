![Build check](https://github.com/cardinalby/tea-collage/workflows/Build%20check/badge.svg)
![Github Pages Deploy](https://github.com/cardinalby/tea-collage/workflows/Github%20Pages%20Deploy/badge.svg)
![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fcardinalby.github.io%2Ftea-collage%2F&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=visitors&edge_flat=false)

## Teas Collage

[Go to Github Pages](https://cardinalby.github.io/tea-collage)

This project is a digital interactive addition to a collage of Chinese tea wrappers that I have been 
drinking for the past three years.

Now this collage hangs in a frame under the glass, and there is a QR code in its center that leads to this site, where you can see what the whole wrappers looked like, fragments of which are shown on the collage and read more about each tea.

At the same time, this site is my learning project, where I decided to refresh my knowledge of modern frontend development technologies. In general, my specialization is backend development, but sometimes I try to look into related areas to stay up to date 🙂

## Build

### Resource extracting

Source of background collage photo, wrappers overlays and paths for background areas are located in 
`resources/teas.psd` under the version control. 
To extract layers images and meta information required for React App run:

`npm run build-resources-processing`\
`npm run process-resources` 

Useful development scripts are:

* `npm run check-resources` quickly checks PSD file and saves json files requered to build React app 
without extracting and resizing actual images
* `npm run update-img-areas-style` quickly updates only `src/areas-map.json` stroke and fill styles.

### Build react app

`npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

`npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

