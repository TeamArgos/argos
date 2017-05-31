package io.github.teamargos.argos.Models;

/**
 * Created by jordan on 4/12/17.
 */

public class DeviceStateChange {
    public Device device;
    public boolean on;

    public DeviceStateChange(Device device, boolean on) {
        this.device = device;
        this.on = on;
    }
}
