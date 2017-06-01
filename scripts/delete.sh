#!/bin/bash
FULCRUM_ID=9cb6d0d20179
FULCRUM_ALEX=8086f28391f4
PROJECT_ID=argos-f950e

firebase database:remove --project $PROJECT_ID /device-history/$FULCRUM_ID