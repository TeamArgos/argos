package io.github.teamargos.argos.Models;

import com.google.gson.annotations.SerializedName;

import java.util.List;

/**
 * Created by jordan on 4/11/17.
 */

public class Device implements Comparable<Device> {
    public String name;
    public String type;
    public String fulcrumId;
    @SerializedName("uniqueid")
    public String id;
    public DeviceState state;
    public Classification classification;
    public long timestamp;
    public float threshold;
    public List<Classification> history;

    public int hashCode() {
        return id.hashCode();
    }

    public int compareTo(Device other) {
        return Long.compare(this.timestamp, other.timestamp);
    }
}
