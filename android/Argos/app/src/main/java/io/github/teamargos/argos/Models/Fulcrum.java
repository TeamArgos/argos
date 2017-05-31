package io.github.teamargos.argos.Models;

import java.util.Objects;

/**
 * Created by jordan on 4/26/17.
 */

public class Fulcrum {
    public String id;

    @Override
    public boolean equals(Object other) {
        if (!(other instanceof Fulcrum)) {
            return false;
        } else {
            Fulcrum o = (Fulcrum) other;
            return o.id.equals(this.id);
        }
    }

    @Override
    public int hashCode() {
        return this.id.hashCode();
    }
}
