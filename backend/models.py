"""Data models shared by the API and statistics code.

The browser sends JSON using JavaScript-style camelCase names such as
``totalScore``.  Python normally uses snake_case names such as ``total_score``.
Pydantic aliases let each side use the naming style that feels natural.
"""

from typing import Any
from math import floor

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ApiModel(BaseModel):
    """Base model that accepts field names or their JSON aliases."""

    model_config = ConfigDict(populate_by_name=True, extra="allow")


class HoleResult(ApiModel):
    """One completed hole; negative scores and counts are invalid."""
    number: int = Field(ge=1)
    par: int = Field(ge=1)
    yardage: int | None = None
    score: int = Field(ge=1)
    putts: int = Field(ge=0)
    fairway: str | None = None
    penalties: int = Field(default=0, ge=0)


class CompletedRound(ApiModel):
    """Metadata plus hole results and the totals used by existing scorecards."""
    id: str
    completed_at: str = Field(alias="completedAt")
    course_id: str | None = Field(default=None, alias="courseId")
    course_name: str = Field(alias="courseName")
    tee_name: str = Field(default="", alias="teeName")
    round_format: str = Field(default="all", alias="roundFormat")
    round_label: str = Field(default="", alias="roundLabel")
    conditions: dict[str, Any] | None = None
    course_rating: float | None = Field(default=None, alias="courseRating")
    slope_rating: float | None = Field(default=None, alias="slopeRating")
    total_score: int = Field(alias="totalScore")
    total_par: int = Field(alias="totalPar")
    score_to_par: int = Field(alias="scoreToPar")
    total_putts: int = Field(alias="totalPutts")
    total_penalties: int = Field(alias="totalPenalties")
    fairways_hit: int = Field(alias="fairwaysHit")
    fairway_opportunities: int = Field(alias="fairwayOpportunities")
    fairway_percentage: int = Field(alias="fairwayPercentage")
    holes: list[HoleResult] = Field(min_length=1, max_length=18)

    @model_validator(mode="after")
    def calculate_totals(self):
        """Derive totals from the holes instead of trusting submitted totals.

        This runs after validation for both storage and statistics requests.
        Editing a hole therefore cannot leave stale totals in the database.
        """
        self.total_score = sum(hole.score for hole in self.holes)
        self.total_par = sum(hole.par for hole in self.holes)
        self.score_to_par = self.total_score - self.total_par
        self.total_putts = sum(hole.putts for hole in self.holes)
        self.total_penalties = sum(hole.penalties for hole in self.holes)
        fairway_holes = [hole for hole in self.holes if hole.par != 3]
        self.fairway_opportunities = len(fairway_holes)
        self.fairways_hit = sum(hole.fairway == "hit" for hole in fairway_holes)
        self.fairway_percentage = (
            floor(self.fairways_hit / self.fairway_opportunities * 100 + 0.5)
            if self.fairway_opportunities else 0
        )
        return self

    def as_browser_json(self) -> dict[str, Any]:
        """Return a dictionary with the field names expected by JavaScript."""

        return self.model_dump(by_alias=True)
