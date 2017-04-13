package io.github.teamargos.argos.Models;

import com.google.gson.annotations.SerializedName;

/**
 * Created by jordan on 4/11/17.
 */

public class Device {
    public String name;
    public String type;
    public String fulcrumId;

    @SerializedName("uniqueid")
    public String id;
    public DeviceState state;
}
