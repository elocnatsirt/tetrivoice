#!/usr/bin/env bash

# Local Server
run_server() {
  port=$(( ( RANDOM % 100 )  + 8000 ))

  if [[ "$OSTYPE" == "linux-gnu" ]]; then
    google-chrome http://localhost:$port
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    open -a "Google Chrome" http://localhost:$port/dist
  else
    echo "Navigate to http://localhost:$port/dist in your (Chrome) browser"
  fi

  python --version | grep 'Python 3' &> /dev/null
  if [ $? -eq 0 ]; then
    python -m http.server $port
  else
    python -m HTTPServer $port
  fi
}

# Package
# package() {
#   # cd ./build
#   # build_name=build_$(date +%s).zip
#   # zip -r $build_name ./*
#   # mv $build_name ../builds/
#   # cd ../
#   # echo "Build located at $(pwd)/builds/$build_name"
# }

# Build
build() {
  # rsync -avr --exclude='.git*' --exclude='build/' --exclude='builds/' --exclude='.eslintrc.js' --exclude='tools.sh' ./ ./build/
  # package

  npm run build
}

while getopts “sb” opt; do
  case $opt in
    s ) run_server
    ;;
    b ) build
    ;;
  esac
done