import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FormDialog } from "@/components/dialogs/FormDialog";
import { ModalFrame } from "@/components/dialogs/ModalFrame";
import { ViewDialog } from "@/components/dialogs/ViewDialog";
import { renderWithProviders, screen } from "test/test-utils";

describe("ModalFrame & Dialogs Subsystem", () => {
  it("renders ModalFrame dialog variant with title and children", () => {
    renderWithProviders(
      <ModalFrame open onOpenChange={vi.fn()} title="Test Dialog Title" description="Test Dialog Description">
        <div>Modal Body Content</div>
      </ModalFrame>,
    );

    expect(screen.getByText("Test Dialog Title")).toBeInTheDocument();
    expect(screen.getByText("Test Dialog Description")).toBeInTheDocument();
    expect(screen.getByText("Modal Body Content")).toBeInTheDocument();
  });

  it("renders ModalFrame sheet variant with title and children", () => {
    renderWithProviders(
      <ModalFrame
        open
        onOpenChange={vi.fn()}
        variant="sheet"
        title="Test Sheet Title"
        description="Test Sheet Description"
      >
        <div>Sheet Body Content</div>
      </ModalFrame>,
    );

    expect(screen.getByText("Test Sheet Title")).toBeInTheDocument();
    expect(screen.getByText("Test Sheet Description")).toBeInTheDocument();
    expect(screen.getByText("Sheet Body Content")).toBeInTheDocument();
  });

  it("supports allowFullscreen and toggles fullscreen state in ModalFrame", () => {
    const handleFullscreenChange = vi.fn();
    renderWithProviders(
      <ModalFrame
        open
        onOpenChange={vi.fn()}
        allowFullscreen
        onFullscreenChange={handleFullscreenChange}
        title="Fullscreen Dialog"
      >
        <div>Content</div>
      </ModalFrame>,
    );

    const toggleBtn = screen.getByRole("button", { name: /全屏|fullscreen/i });
    expect(toggleBtn).toBeInTheDocument();
    fireEvent.click(toggleBtn);
    expect(handleFullscreenChange).toHaveBeenCalledWith(true);
  });

  it("renders FormDialog with submit and cancel buttons and triggers onSubmit", () => {
    const handleSubmit = vi.fn((e) => e.preventDefault());
    const handleOpenChange = vi.fn();

    renderWithProviders(
      <FormDialog
        open
        onOpenChange={handleOpenChange}
        title="Edit User"
        onSubmit={handleSubmit}
        submitText="Save Changes"
        cancelText="Abort"
      >
        <div>
          <label htmlFor="name-input">Name</label>
          <input id="name-input" defaultValue="Alice" />
        </div>
      </FormDialog>,
    );

    expect(screen.getByText("Edit User")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("Alice");

    const submitBtn = screen.getByRole("button", { name: "Save Changes" });
    const cancelBtn = screen.getByRole("button", { name: "Abort" });

    fireEvent.click(cancelBtn);
    expect(handleOpenChange).toHaveBeenCalledWith(false);

    fireEvent.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("renders ViewDialog with close button and triggers onOpenChange(false)", () => {
    const handleOpenChange = vi.fn();

    renderWithProviders(
      <ViewDialog open onOpenChange={handleOpenChange} title="View Details" closeText="Dismiss">
        <div>Details Pane</div>
      </ViewDialog>,
    );

    expect(screen.getByText("View Details")).toBeInTheDocument();
    expect(screen.getByText("Details Pane")).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: "Dismiss" });
    fireEvent.click(closeBtn);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
