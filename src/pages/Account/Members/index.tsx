import { useTranslation } from "react-i18next";
import {
  TabButton,
  TabContent,
  TabPanel,
  Tabs,
  TabsList,
} from "@/components/Tabs";
import React from "react";
import { ListInvites } from "./ListInvites";
import { ListMembers } from "./ListMembers";
import { useSearchParams } from "react-router";

export const Members = () => {
  const { t } = useTranslation();
  const [tab, setTab] = React.useState("pending");

  const [searchParams] = useSearchParams();
  const accountId = searchParams.get("accountId");

  return (
    <>
      <div className="flex flex-col gap-3 items-start w-full h-full">
        <div className="flex items-start justify-between gap-3 w-full sticky top-0 z-10 max-w-lg mx-auto px-3">
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-medium">{t("Members")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("Manage your account members & invites")}
            </p>
          </div>
        </div>

        <Tabs defaultValue={tab} onValueChange={(tab) => setTab(tab)}>
          <TabsList className="w-full max-w-fit mx-auto">
            {["pending", "accepted"].map((t, i) => (
              <TabButton
                key={t + i.toString()}
                value={t}
                variant="outline"
                className="capitalize"
              >
                {t}
              </TabButton>
            ))}
          </TabsList>

          {/* Tab content */}
          <TabPanel className="w-full h-full">
            <TabContent value="pending">
              <ListInvites />
            </TabContent>

            <TabContent value="accepted">
              <ListMembers />
            </TabContent>
          </TabPanel>
        </Tabs>
      </div>
    </>
  );
};
