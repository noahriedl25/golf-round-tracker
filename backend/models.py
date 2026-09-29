"""Data models shared by the API and statistics code.

The browser sends JSON using JavaScript-style camelCase names such as
``totalScore``.  Python normally uses snake_case names such as ``total_score``.
Pydantic aliases let each side use the naming style that feels natural.
"""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ApiModel(BaseModel):
    """Base model that accepts field names or their JSON aliases."""

    model_config = ConfigDict(populate_by_name=True, extra="allow")


class HoleResult(ApiModel):
    number: int
    par: int
    yardage: int | None = None
    score: int
    putts: int
    fairway: str | None = None
    penalties: int = 0


class CompletedRound(ApiModel):
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
    holes: list[HoleResult]

    def as_browser_json(self) -> dict[str, Any]:
        """Return a dictionary with the field names expected by JavaScript."""

        return self.model_dump(by_alias=True)
