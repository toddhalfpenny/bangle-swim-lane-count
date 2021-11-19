/**
 * swim-length-count.js
 */

var lengths = 0;
var curLenCompassAverage = 0;
var curLenReadingCount = 0;
var curAvgAcc = 0;

const bucketSize = 100;
var curBucketCompassAverage = 0;
var curBucketReadingCount = 0;
var curBucketAcc = 0;

var wasUncalibrated = false;

var W = g.getWidth();
var M = W/2; // middle of screen

Bangle.on('mag', function(m) {
  if (!Bangle.isLCDOn()) return;
  g.reset();
  if (isNaN(m.heading)) {
    if (!wasUncalibrated) {
      g.setFontAlign(0,-1).setFont("6x8");
      g.drawString("Uncalibrated\nturn 360° around",M,24+4);
      wasUncalibrated = true;
    }
  } else {
    if (wasUncalibrated) {
      wasUncalibrated = false;
    }
    // Update current bucket readings
    curBucketReadingCount++;
    curBucketAcc += Math.round(m.heading);
    curBucketCompassAverage = Math.round(curBucketAcc / curBucketReadingCount);

    if ( curBucketReadingCount >= 100 ) {
        if ( curLenReadingCount > 0  && isReadingOdd(curBucketCompassAverage ,curLenCompassAverage) ){
            // Put it into Odd reading array?
            Bangle.buzz();
        } else {
            curLenReadingCount++;
            curAvgAcc += curBucketCompassAverage;
            curLenCompassAverage = Math.round(curAvgAcc / curLenReadingCount);
            curBucketReadingCount = 0;
        }
        curBucketReadingCount = 0;
        curBucketAcc = 0;
    }

    updateUI(m.heading);
  }
});

function isReadingOdd(reading, curAvg) {
    console.log(reading, curAvg);
    const acceptableVariance = 30;

    // Maybe move reading to negative or 360+, for comparrison.
    var adjustedReading = reading;
    if ((curAvg > 360 - acceptableVariance) &&
        (reading < acceptableVariance) ) {
        adjustedReading = 360 + reading;
    } else if ((curAvg < acceptableVariance) &&
        (reading > 360 - acceptableVariance)) {
        adjustedReading = 0 - (360 - reading);
    }

    console.log('adjustedReading', adjustedReading);

    if ( adjustedReading > (curAvg - acceptableVariance) &&
         adjustedReading < (curAvg + acceptableVariance)) {
        console.log('Reading is OK');
        return false;
    } else {
        console.log('Reading is ODD');
        return true;
    }
}

function updateUI(heading) {
    g.setFontAlign(0,0).setFont("6x8",3);
    var y = 30;
    g.drawString(Math.round(heading),M,y,true);
    y = 60;
    g.drawString(curLenReadingCount + '(' + curBucketReadingCount + ')',M,y,true);
    y = 90;
    g.drawString(curLenCompassAverage + '(' + curBucketCompassAverage + ')',M,y,true);
    // g.drawString(curBucketCompassAverage,M,y,true);
}

g.clear();
Bangle.setCompassPower(1, 'todd-swim-length');
Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);