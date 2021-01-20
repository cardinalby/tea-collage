![Github Pages Deploy](https://github.com/cardinalby/tea-collage/workflows/Github%20Pages%20Deploy/badge.svg)
![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fcardinalby.github.io%2Ftea-collage%2F&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=visitors&edge_flat=false)

## Teas Collage

This project is a digital interactive addition to a collage of Chinese tea wrappers that I have been 
drinking for the past three years.

Now this collage hangs in a frame under the glass, and there is a QR code in its center that leads to this site, where you can see what the whole wrappers looked like, fragments of which are shown on the collage and read more about each tea.

At the same time, this site is my learning project, where I decided to refresh my knowledge of modern frontend development technologies. In general, my specialization is backend development, but sometimes I try to look into related areas to stay up to date 🙂

## Build

### Resource extracting

Source of background collage photo and wrappers overlays are located in `resources/teas.psd` under 
the version control. To extract layers images and meta information required for React App run:

`npm run build-resources-processing`\
`npm run process-resources` 

### Build react app

`npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

`npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

