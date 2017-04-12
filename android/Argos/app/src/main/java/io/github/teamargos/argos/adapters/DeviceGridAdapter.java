package io.github.teamargos.argos.adapters;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;

import java.util.List;

import io.github.teamargos.argos.Models.Device;
import io.github.teamargos.argos.views.DeviceTileView;

/**
 * Created by jordan on 4/11/17.
 */

public class DeviceGridAdapter extends BaseAdapter {
    private Context context;
    private List<Device> devices;

    public DeviceGridAdapter(Context c, List<Device> devices) {
        this.context = c;
        this.devices = devices;
    }

    @Override
    public int getCount() {
        return devices.size();
    }

    public Object getItem(int position) {
        return this.devices.get(position);
    }

    public long getItemId(int position) {
        return 0;
    }

    public View getView(int position, View convertView, ViewGroup parent) {
        DeviceTileView deviceView;
        if (convertView == null) {
            deviceView = new DeviceTileView(this.context);
        } else {
            deviceView = (DeviceTileView) convertView;
        }
        return deviceView;
    }
}
