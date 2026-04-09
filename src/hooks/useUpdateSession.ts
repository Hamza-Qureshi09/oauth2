import React from "react";
import { authClient } from "@/lib/auth";
import { getDeviceInfo } from "@/lib/utils";
import type { TDeviceInfo } from "@/typings";

export function useUpdateSession() {
    React.useEffect(() => {
        const update = async () => {
            const info = await getDeviceInfo() as TDeviceInfo;
            // @ts-ignore
            const { error } = await authClient.updateSession({ device: info });
            if (error) console.error(error);
        };
        update();
    }, []);
}
