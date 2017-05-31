#!/bin/bash
FULCRUM_ID=9cb6d0d20179
PROJECT_ID=argos-f950e
FULCRUM_ALEX=1

firebase database:remove --project $PROJECT_ID /device-history/$FULCRUM_ID