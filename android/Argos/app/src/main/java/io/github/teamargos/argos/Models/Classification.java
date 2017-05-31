package io.github.teamargos.argos.Models;

import com.google.gson.annotations.SerializedName;

/**
 * Created by jordan on 5/7/17.
 */

public class Classification implements Comparable<Classification> {
    public boolean anomaly;
    @SerializedName("class")
    public String className;
    public float certainty;
    public long timestamp;


    public int compareTo(Classification other) {
        return Long.compare(this.timestamp, other.timestamp);
    }
}
