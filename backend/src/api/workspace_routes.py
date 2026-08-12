"""Workspace CRUD — user workspaces for organizing chats and projects."""
import json
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from ..core.config import settings
from .dependencies import get_current_user

router = APIRouter(prefix="/api/v1/workspaces", tags=["workspaces"])


def _workspaces_path() -> Path:
    p = Path(settings.data_dir) / "workspaces.json"
    p.parent.mkdir(parents=True, exist_ok=True)
    if not p.exists():
        p.write_text("[]")
    return p


def _load_workspaces() -> list[dict]:
    return json.loads(_workspaces_path().read_text())


def _save_workspaces(workspaces: list[dict]) -> None:
    _workspaces_path().write_text(json.dumps(workspaces, indent=2))


class CreateWorkspaceRequest(BaseModel):
    name: str
    description: str = ""


class UpdateWorkspaceRequest(BaseModel):
    name: str | None = None
    description: str | None = None


@router.get("")
async def list_workspaces(user: dict = Depends(get_current_user)):
    workspaces = _load_workspaces()
    return [w for w in workspaces if w["user_id"] == user["id"]]


@router.post("")
async def create_workspace(req: CreateWorkspaceRequest, user: dict = Depends(get_current_user)):
    workspaces = _load_workspaces()
    ws = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "name": req.name,
        "description": req.description,
        "chat_count": 0,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    workspaces.append(ws)
    _save_workspaces(workspaces)
    return ws


@router.get("/{workspace_id}")
async def get_workspace(workspace_id: str, user: dict = Depends(get_current_user)):
    workspaces = _load_workspaces()
    for w in workspaces:
        if w["id"] == workspace_id and w["user_id"] == user["id"]:
            return w
    raise HTTPException(status_code=404, detail="Workspace not found")


@router.patch("/{workspace_id}")
async def update_workspace(workspace_id: str, req: UpdateWorkspaceRequest, user: dict = Depends(get_current_user)):
    workspaces = _load_workspaces()
    for w in workspaces:
        if w["id"] == workspace_id and w["user_id"] == user["id"]:
            if req.name is not None:
                w["name"] = req.name
            if req.description is not None:
                w["description"] = req.description
            w["updated_at"] = datetime.utcnow().isoformat()
            _save_workspaces(workspaces)
            return w
    raise HTTPException(status_code=404, detail="Workspace not found")


@router.delete("/{workspace_id}")
async def delete_workspace(workspace_id: str, user: dict = Depends(get_current_user)):
    workspaces = _load_workspaces()
    new_workspaces = [w for w in workspaces if not (w["id"] == workspace_id and w["user_id"] == user["id"])]
    if len(new_workspaces) == len(workspaces):
        raise HTTPException(status_code=404, detail="Workspace not found")
    _save_workspaces(new_workspaces)
    return {"deleted": True}
