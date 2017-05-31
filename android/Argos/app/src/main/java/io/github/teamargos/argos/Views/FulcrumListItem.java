package io.github.teamargos.argos.Views;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.LinearLayout;
import io.github.teamargos.argos.Adapters.FulcrumListAdapter;
import io.github.teamargos.argos.Models.Fulcrum;
import io.github.teamargos.argos.R;

/**
 * Created by jordan on 4/26/17.
 */

public class FulcrumListItem extends LinearLayout {

    public FulcrumListItem(Context c) {
        super(c);
        init();
    }

    public FulcrumListItem(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public FulcrumListItem(Context context, AttributeSet attrs, int defStyle) {
        super(context, attrs, defStyle);
        init();
    }

    private void init() {
        inflate(getContext(), R.layout.fulcrum_list_item, this);
    }
}
