#!/usr/bin/env bash
mogrify original.png -trim +repage -fuzz 1%
convert original.png -thumbnail 128x128 icon128.png
convert original.png -thumbnail 48x48 icon48.png
convert original.png -thumbnail 38x38 icon38.png
convert original.png -thumbnail 19x19 icon19.png
convert original.png -thumbnail 16x16 icon16.png

convert original.png -colorspace Gray -thumbnail 128x128 icon128_grey.png
convert original.png -colorspace Gray -thumbnail 48x48 icon48_grey.png
convert original.png -colorspace Gray -thumbnail 38x38 icon38_grey.png
convert original.png -colorspace Gray -thumbnail 19x19 icon19_grey.png
convert original.png -colorspace Gray -thumbnail 16x16 icon16_grey.png

optipng *.png
