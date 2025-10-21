"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  GripVerticalIcon
} from "lucide-react";
import { startTransition, useId, useMemo, useState } from "react";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { RelatedEventModel } from "@/configs/prisma/zod";
import { formatDatetime } from "@/utils";
import { AddEventDrawerClient } from "./AddEventDrawer.client";
import { TableCellViewerClient } from "./TableCellViewer.client";

const PAGE_SIZE_10 = 10;
const PAGE_SIZE_20 = 20;
const PAGE_SIZE_30 = 30;
const PAGE_SIZE_40 = 40;
const PAGE_SIZE_50 = 50;
const PAGE_SIZE_OPTIONS = [PAGE_SIZE_10, PAGE_SIZE_20, PAGE_SIZE_30, PAGE_SIZE_40, PAGE_SIZE_50] as const;

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      className='size-7 text-muted-foreground hover:bg-transparent'
      size='icon'
      variant='ghost'
    >
      <GripVerticalIcon className='size-3 text-muted-foreground' />
      <span className='sr-only'>Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<z.infer<typeof RelatedEventModel>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          aria-label='Select all'
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className='flex items-center justify-center'>
        <Checkbox
          aria-label='Select row'
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "title",
    header: "Sự kiện",
    cell: ({ row }) => <TableCellViewerClient item={row.original} />,
    enableHiding: false
  },
  {
    accessorKey: "timeStart",
    header: "Bắt đầu",
    cell: ({ row }) => (
      <div className='w-32'>
        <Badge className='px-1.5 text-muted-foreground' variant='outline'>
          {formatDatetime(new Date(row.original.timeStart))}
        </Badge>
      </div>
    )
  },
  {
    accessorKey: "duration",
    header: "Thời gian (phút)",
    cell: ({ row }) => (
      <div className='w-32'>
        <Badge className='px-1.5 text-muted-foreground' variant='outline'>
          {row.original.duration}
        </Badge>
      </div>
    )
  }
];

function DraggableRow({ row }: { row: Row<z.infer<typeof RelatedEventModel>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id
  });

  return (
    <TableRow
      className='relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80'
      data-dragging={isDragging}
      data-state={row.getIsSelected() && "selected"}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
      ))}
    </TableRow>
  );
}

export function DataTable({ data: initialData }: { data: z.infer<typeof RelatedEventModel>[] }) {
  const [data, setData] = useState(() => initialData);
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10
  });
  const sortableId = useId();
  const sensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));

  const dataIds = useMemo<UniqueIdentifier[]>(() => data?.map(({ id }) => id) || [], [data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues()
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  function handleAddEventSuccess(newEvent: z.infer<typeof RelatedEventModel>) {
    startTransition(() => {
      setData((prev) => [newEvent, ...prev]);
    });
  }

  return (
    <Tabs className='flex w-full flex-col justify-start gap-6' defaultValue='outline'>
      <div className='flex items-center justify-between px-4 lg:px-6'>
        <Label className='sr-only' htmlFor='view-selector'>
          View
        </Label>

        <div className='ml-auto flex items-center gap-2'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size='sm' variant='outline'>
                <ColumnsIcon />
                <span className='hidden lg:inline'>Customize Columns</span>
                <span className='lg:hidden'>Columns</span>
                <ChevronDownIcon />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-56'>
              {table
                .getAllColumns()
                .filter((column) => typeof column.accessorFn !== "undefined" && column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    checked={column.getIsVisible()}
                    className='capitalize'
                    key={column.id}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <AddEventDrawerClient
            onSuccess={(newEvent: z.infer<typeof RelatedEventModel>) => handleAddEventSuccess(newEvent)}
          />
        </div>
      </div>
      <TabsContent className='relative flex flex-col gap-4 overflow-auto px-4 lg:px-6' value='outline'>
        <div className='overflow-hidden rounded-lg border'>
          <DndContext
            collisionDetection={closestCenter}
            id={sortableId}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
          >
            <Table>
              <TableHeader className='sticky top-0 z-10 bg-muted'>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead colSpan={header.colSpan} key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className='**:data-[slot=table-cell]:first:w-8'>
                {table.getRowModel().rows?.length ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell className='h-24 text-center' colSpan={columns.length}>
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        <div className='flex items-center justify-between px-4'>
          <div className='hidden flex-1 text-muted-foreground text-sm lg:flex'>
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
            selected.
          </div>
          <div className='flex w-full items-center gap-8 lg:w-fit'>
            <div className='hidden items-center gap-2 lg:flex'>
              <Label className='font-medium text-sm' htmlFor='rows-per-page'>
                Rows per page
              </Label>
              <Select
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
                value={`${table.getState().pagination.pageSize}`}
              >
                <SelectTrigger className='w-20' id='rows-per-page'>
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
                </SelectTrigger>
                <SelectContent side='top'>
                  {PAGE_SIZE_OPTIONS.map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='flex w-fit items-center justify-center font-medium text-sm'>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <div className='ml-auto flex items-center gap-2 lg:ml-0'>
              <Button
                className='hidden h-8 w-8 p-0 lg:flex'
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.setPageIndex(0)}
                variant='outline'
              >
                <span className='sr-only'>Go to first page</span>
                <ChevronsLeftIcon />
              </Button>
              <Button
                className='size-8'
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                size='icon'
                variant='outline'
              >
                <span className='sr-only'>Go to previous page</span>
                <ChevronLeftIcon />
              </Button>
              <Button
                className='size-8'
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                size='icon'
                variant='outline'
              >
                <span className='sr-only'>Go to next page</span>
                <ChevronRightIcon />
              </Button>
              <Button
                className='hidden size-8 lg:flex'
                disabled={!table.getCanNextPage()}
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                size='icon'
                variant='outline'
              >
                <span className='sr-only'>Go to last page</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent className='flex flex-col px-4 lg:px-6' value='past-performance'>
        <div className='aspect-video w-full flex-1 rounded-lg border border-dashed' />
      </TabsContent>
      <TabsContent className='flex flex-col px-4 lg:px-6' value='key-personnel'>
        <div className='aspect-video w-full flex-1 rounded-lg border border-dashed' />
      </TabsContent>
      <TabsContent className='flex flex-col px-4 lg:px-6' value='focus-documents'>
        <div className='aspect-video w-full flex-1 rounded-lg border border-dashed' />
      </TabsContent>
    </Tabs>
  );
}
