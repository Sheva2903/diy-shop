import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  createCategory,
  deleteCategory,
  getSellerCategories,
  updateCategory,
  type SellerCategory
} from "../../api/seller";
import { Badge } from "../../components/ui/Badge";
import { Button, IconButton } from "../../components/ui/Button";
import { EmptyState, ErrorState, TableRowSkeleton } from "../../components/ui/Feedback";
import { TextField } from "../../components/ui/Field";
import { ConfirmDialog, Modal } from "../../components/ui/Modal";
import { useToast } from "../../components/ui/toast";

type Draft = { name_vi: string; name_en: string; visible: boolean };

const emptyDraft: Draft = { name_vi: "", name_en: "", visible: true };

export function SellerCategoriesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [editing, setEditing] = useState<SellerCategory | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState<string | undefined>();
  const [pendingDelete, setPendingDelete] = useState<SellerCategory | null>(null);

  const categoriesQuery = useQuery({ queryKey: ["seller", "categories"], queryFn: getSellerCategories });

  const closeForm = () => {
    setEditing(null);
    setCreating(false);
    setDraft(emptyDraft);
    setError(undefined);
  };

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["seller"] });

  const saveMutation = useMutation({
    mutationFn: (input: Draft) =>
      editing ? updateCategory(editing.id, input) : createCategory(input),
    onSuccess: () => {
      void invalidate();
      toast.success(editing ? "Category saved" : "Category created");
      closeForm();
    },
    onError: (mutationError: Error) => toast.error(mutationError.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      void invalidate();
      setPendingDelete(null);
      toast.success("Category deleted");
    },
    onError: (mutationError: Error) => {
      setPendingDelete(null);
      toast.error(mutationError.message);
    }
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.name_vi.trim()) {
      setError("Vietnamese name is required");
      return;
    }
    setError(undefined);
    saveMutation.mutate({ ...draft, name_vi: draft.name_vi.trim(), name_en: draft.name_en.trim() });
  };

  const openEdit = (category: SellerCategory) => {
    setEditing(category);
    setCreating(false);
    setDraft({ name_vi: category.name_vi, name_en: category.name_en ?? "", visible: category.visible });
  };

  if (categoriesQuery.isError) {
    return <ErrorState title="Could not load categories" description={categoriesQuery.error.message} />;
  }

  const categories = categoriesQuery.data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="max-w-lg text-[14px] text-text-muted">
          Categories group your products in the storefront navigation. A category that still holds
          products cannot be deleted.
        </p>
        <Button
          onClick={() => {
            setCreating(true);
            setEditing(null);
            setDraft(emptyDraft);
          }}
        >
          Add category
        </Button>
      </div>

      <div className="overflow-hidden rounded-card bg-surface shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-hairline bg-canvas/60 text-[12px] font-semibold tracking-wide text-text-muted uppercase">
                <th className="px-5 py-3 font-semibold">Name (VI)</th>
                <th className="px-5 py-3 font-semibold">Name (EN)</th>
                <th className="px-5 py-3 text-right font-semibold">Products</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {categoriesQuery.isPending ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <TableRowSkeleton key={index} columns={5} />
                ))
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      title="No categories yet"
                      description="Create your first category to organise products."
                      className="shadow-none"
                    />
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr
                    key={category.id}
                    className="align-middle text-[14px] transition-colors hover:bg-canvas"
                  >
                    <td className="px-5 py-3.5 font-semibold text-text">{category.name_vi}</td>
                    <td className="px-5 py-3.5 text-text-muted">{category.name_en || "—"}</td>
                    <td className="px-5 py-3.5 text-right text-text tabular-nums">
                      {category.productCount}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={category.visible ? "mint" : "neutral"}>
                        {category.visible ? "Visible" : "Hidden"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-0.5">
                        <IconButton
                          aria-label={`Edit ${category.name_vi}`}
                          onClick={() => openEdit(category)}
                        >
                          <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z" />
                          </svg>
                        </IconButton>
                        <IconButton
                          aria-label={`Delete ${category.name_vi}`}
                          tone="danger"
                          disabled={category.productCount > 0}
                          title={
                            category.productCount > 0
                              ? "Move its products to another category first"
                              : undefined
                          }
                          onClick={() => setPendingDelete(category)}
                        >
                          <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
                          </svg>
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={creating || !!editing}
        onClose={closeForm}
        title={editing ? "Edit category" : "Add category"}
        footer={
          <>
            <Button variant="ghost" onClick={closeForm} disabled={saveMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <TextField
            label="Category name (VI)"
            required
            autoFocus
            value={draft.name_vi}
            error={error}
            onChange={(event) => setDraft((d) => ({ ...d, name_vi: event.target.value }))}
          />
          <TextField
            label="Category name (EN)"
            value={draft.name_en}
            onChange={(event) => setDraft((d) => ({ ...d, name_en: event.target.value }))}
          />
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={draft.visible}
              onChange={(event) => setDraft((d) => ({ ...d, visible: event.target.checked }))}
              className="size-4 accent-action"
            />
            <span className="text-[15px] text-text">Visible in the storefront</span>
          </label>
        </form>
      </Modal>

      {/* plan §2.4 — a category holding products cannot be deleted */}
      <ConfirmDialog
        open={!!pendingDelete}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
        title="Delete category?"
        description={`"${pendingDelete?.name_vi}" will be removed permanently.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        busy={deleteMutation.isPending}
      />
    </div>
  );
}
