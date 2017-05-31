IN_FILE=$1
OUT_DIR=$2
START=6
LENGTH=12
WIDTH=860

ffmpeg -ss $START -i $IN_FILE -t $LENGTH -f mp4 $OUT_DIR/video.mp4

ffmpeg -y -ss $START -t $LENGTH -i $IN_FILE -vf fps=10,scale=$WIDTH:-1:flags=lanczos,palettegen \
    $OUT_DIR/palette.png
ffmpeg -ss $START -t $LENGTH -i $IN_FILE -i $OUT_DIR/palette.png -filter_complex \
    "fps=10,scale=$WIDTH:-1:flags=lanczos[x];[x][1:v]paletteuse" $OUT_DIR/output.gif
