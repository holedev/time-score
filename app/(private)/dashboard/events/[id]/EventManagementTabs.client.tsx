"use client";

import { ClipboardListIcon, UserCheckIcon, UsersIcon } from "lucide-react";
import z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RelatedEventModel } from "@/configs/prisma/zod";
import { CriteriaTabClient } from "./criteria/CriteriaTab.client";
import { ReviewerTabClient } from "./reviewer/ReviewerTab.client";
import { TeamTabClient } from "./team/TeamTab.client";

type EventManagementTabsProps = {
  event: z.infer<typeof RelatedEventModel>;
};

function EventManagementTabs({ event }: EventManagementTabsProps) {
  const teams = event.teams || [];
  const reviewers = event.eventReviewers || [];
  const criteriaTemplate = event.criteriaTemplateId;

  return (
    <div className='w-full'>
      <Tabs className='w-full' defaultValue='teams'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger className='flex items-center gap-2' value='teams'>
            <UsersIcon className='h-4 w-4' />
            Đội ({teams.length})
          </TabsTrigger>
          <TabsTrigger className='flex items-center gap-2' value='criteria'>
            <ClipboardListIcon className='h-4 w-4' />
            Tiêu chí ({criteriaTemplate ? "Có" : "Chưa có"})
          </TabsTrigger>
          <TabsTrigger className='flex items-center gap-2' value='reviewers'>
            <UserCheckIcon className='h-4 w-4' />
            Giám khảo ({reviewers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent className='space-y-4' value='teams'>
          <TeamTabClient event={event} />
        </TabsContent>

        <TabsContent className='space-y-4' value='criteria'>
          <CriteriaTabClient event={event} />
        </TabsContent>

        <TabsContent className='space-y-4' value='reviewers'>
          <ReviewerTabClient event={event} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { EventManagementTabs };
