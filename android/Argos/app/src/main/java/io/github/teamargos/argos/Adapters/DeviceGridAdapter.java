package io.github.teamargos.argos.Adapters;

import android.content.Context;
import android.graphics.drawable.Drawable;
import android.support.v4.content.ContextCompat;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.GridView;
import android.widget.TextView;

import java.util.List;

import io.github.teamargos.argos.Models.Device;
import io.github.teamargos.argos.R;
import io.github.teamargos.argos.Views.DeviceTileView;

/**
 * Created by jordan on 4/11/17.
 */

public class DeviceGridAdapter extends BaseAdapter {
    private Context context;
    private List<Device> devices;
    private static String TAG = DeviceGridAdapter.class.getName();

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
        Device device = this.devices.get(position);
        TextView name = (TextView) deviceView.findViewById(R.id.device_name);
        name.setText(device.name);
        Drawable d;
        if (device.state.on) {
            d = ContextCompat.getDrawable(this.context, R.drawable.device_tile_on);
        } else {
            d = ContextCompat.getDrawable(this.context, R.drawable.device_tile_off);
        }
        deviceView.setBackground(d);
        return deviceView;
    }
}
