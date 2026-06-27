'use client';
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = IssueDetailPage;
var react_1 = require("react");
var useAuth_1 = require("@/hooks/useAuth");
var constants_1 = require("@/lib/constants");
var date_fns_1 = require("date-fns");
var UpvoteButton_1 = require("@/components/issues/UpvoteButton");
var StatusTimeline_1 = require("@/components/issues/StatusTimeline");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var custom_select_1 = require("@/components/ui/custom-select");
var sonner_1 = require("sonner");
var dynamic_1 = require("next/dynamic");
var navigation_1 = require("next/navigation");
var MapWrapper = (0, dynamic_1.default)(function () { return Promise.resolve().then(function () { return require('@/components/map/MapWrapper'); }).then(function (mod) { return mod.MapWrapper; }); }, { ssr: false });
function IssueDetailPage() {
    var _this = this;
    var id = (0, navigation_1.useParams)().id;
    var user = (0, useAuth_1.useAuth)().user;
    var _a = (0, react_1.useState)(null), issue = _a[0], setIssue = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(false), issueRemoved = _c[0], setIssueRemoved = _c[1];
    var _d = (0, react_1.useState)(''), commentText = _d[0], setCommentText = _d[1];
    var _e = (0, react_1.useState)(false), isSubmitting = _e[0], setIsSubmitting = _e[1];
    var _f = (0, react_1.useState)(false), isVerifying = _f[0], setIsVerifying = _f[1];
    var _g = (0, react_1.useState)(''), pendingStatus = _g[0], setPendingStatus = _g[1];
    var _h = (0, react_1.useState)(false), isUpdatingStatus = _h[0], setIsUpdatingStatus = _h[1];
    var _j = (0, react_1.useState)(false), isEditing = _j[0], setIsEditing = _j[1];
    var _k = (0, react_1.useState)(false), isSavingEdit = _k[0], setIsSavingEdit = _k[1];
    var _l = (0, react_1.useState)({
        title: '',
        description: '',
        category: 'other',
        severity: 'low',
        address: '',
        lat: '',
        lng: '',
        images: '',
    }), editForm = _l[0], setEditForm = _l[1];
    var issueStatus = issue === null || issue === void 0 ? void 0 : issue.status;
    var issueId = issue === null || issue === void 0 ? void 0 : issue._id;
    (0, react_1.useEffect)(function () {
        var fetchIssue = function () { return __awaiter(_this, void 0, void 0, function () {
            var res, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, 5, 6]);
                        return [4 /*yield*/, fetch("/api/issues/".concat(id))];
                    case 1:
                        res = _a.sent();
                        if (res.status === 410) {
                            setIssueRemoved(true);
                            return [2 /*return*/];
                        }
                        if (!res.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, res.json()];
                    case 2:
                        data = _a.sent();
                        setIssue(data.issue);
                        _a.label = 3;
                    case 3: return [3 /*break*/, 6];
                    case 4:
                        error_1 = _a.sent();
                        console.error('Failed to fetch issue', error_1);
                        return [3 /*break*/, 6];
                    case 5:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        if (id)
            fetchIssue();
    }, [id]);
    (0, react_1.useEffect)(function () {
        if (issueStatus) {
            queueMicrotask(function () { return setPendingStatus(issueStatus); });
        }
    }, [issueStatus, issueId]);
    var handleIssueUpdate = function (updated) {
        setIssue(function (prev) {
            if (!prev)
                return updated;
            return __assign(__assign({}, prev), { upvotes: updated.upvotes, status: updated.status, statusHistory: updated.statusHistory, verifiedBy: updated.verifiedBy, title: updated.title, description: updated.description, category: updated.category, severity: updated.severity, location: updated.location, images: updated.images, editedAt: updated.editedAt, priorityScore: updated.priorityScore, resolvedAt: updated.resolvedAt, updatedAt: updated.updatedAt, reporterBonusAwarded: updated.reporterBonusAwarded, mergedReportsCount: updated.mergedReportsCount });
        });
    };
    var handleComment = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var res, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!commentText.trim())
                        return [2 /*return*/];
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    return [4 /*yield*/, fetch("/api/issues/".concat(id, "/comment"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: commentText })
                        })];
                case 2:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 3:
                    data = _a.sent();
                    if (res.ok) {
                        setIssue(data.issue);
                        setCommentText('');
                        sonner_1.toast.success('Comment added');
                    }
                    else {
                        sonner_1.toast.error(data.error || 'Failed to add comment');
                    }
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    console.error(error_2);
                    sonner_1.toast.error('Unexpected error occurred');
                    return [3 /*break*/, 6];
                case 5:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var startEditing = function () {
        var _a, _b;
        if (!issue)
            return;
        setEditForm({
            title: issue.title,
            description: issue.description,
            category: issue.category,
            severity: issue.severity,
            address: issue.location.address || '',
            lat: String((_a = issue.location.coordinates[1]) !== null && _a !== void 0 ? _a : ''),
            lng: String((_b = issue.location.coordinates[0]) !== null && _b !== void 0 ? _b : ''),
            images: issue.images.join('\n'),
        });
        setIsEditing(true);
    };
    var cancelEditing = function () {
        setIsEditing(false);
    };
    var handleEditSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var lat, lng, res_1, data, handleDeleteComment, handleVerify, handleStatusUpdate, category, statusConfig, severityColor, reporter, reporterId, canVerify, isReporter, isEditLocked, canEdit;
        var _this = this;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    e.preventDefault();
                    if (!issue)
                        return [2 /*return*/];
                    lat = Number(editForm.lat);
                    lng = Number(editForm.lng);
                    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                        sonner_1.toast.error('Enter valid latitude and longitude');
                        return [2 /*return*/];
                    }
                    setIsSavingEdit(true);
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, , 4, 5]);
                    return [4 /*yield*/, fetch("/api/issues/".concat(id), {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                title: editForm.title,
                                description: editForm.description,
                                category: editForm.category,
                                severity: editForm.severity,
                                location: {
                                    type: 'Point',
                                    coordinates: [lng, lat],
                                    address: editForm.address,
                                    ward: issue.location.ward,
                                    city: issue.location.city,
                                },
                                images: editForm.images
                                    .split('\n')
                                    .map(function (image) { return image.trim(); })
                                    .filter(Boolean),
                            }),
                        })];
                case 2:
                    res_1 = _c.sent();
                    return [4 /*yield*/, res_1.json()];
                case 3:
                    data = _c.sent();
                    if (res_1.ok) {
                        setIssue(data.issue);
                        setIsEditing(false);
                        sonner_1.toast.success('Issue updated');
                    }
                    else {
                        handleDeleteComment = function (commentId) { return __awaiter(_this, void 0, void 0, function () {
                            var res_2, data_1, data_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!confirm('Are you sure you want to delete this comment?'))
                                            return [2 /*return*/];
                                        setIsSubmitting(true);
                                        _a.label = 1;
                                    case 1:
                                        _a.trys.push([1, , 3, 4]);
                                        return [4 /*yield*/, fetch("/api/issues/".concat(id, "/comment?commentId=").concat(commentId), {
                                                method: 'DELETE'
                                            })];
                                    case 2:
                                        res_2 = _a.sent();
                                        return [3 /*break*/, 4];
                                    case 3: return [7 /*endfinally*/];
                                    case 4:
                                        if (!res_1.ok) return [3 /*break*/, 6];
                                        return [4 /*yield*/, res_1.json()];
                                    case 5:
                                        data_1 = _a.sent();
                                        setIssue(data_1.issue);
                                        sonner_1.toast.success('Comment deleted');
                                        return [3 /*break*/, 8];
                                    case 6: return [4 /*yield*/, res_1.json()];
                                    case 7:
                                        data_2 = _a.sent();
                                        sonner_1.toast.error(data_2.error || 'Failed to delete comment');
                                        _a.label = 8;
                                    case 8: return [2 /*return*/];
                                }
                            });
                        }); };
                        try { }
                        catch (error) {
                            console.error(error);
                            sonner_1.toast.error('An error occurred');
                        }
                        finally {
                            setIsSubmitting(false);
                        }
                    }
                    handleVerify = function () { return __awaiter(_this, void 0, void 0, function () {
                        var res_3, data_3, error_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!user) {
                                        sonner_1.toast.error('Please login to verify');
                                        return [2 /*return*/];
                                    }
                                    setIsVerifying(true);
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 4, 5, 6]);
                                    return [4 /*yield*/, fetch("/api/issues/".concat(id, "/verify"), { method: 'PATCH' })];
                                case 2:
                                    res_3 = _a.sent();
                                    return [4 /*yield*/, res_3.json()];
                                case 3:
                                    data_3 = _a.sent();
                                    if (res_3.ok) {
                                        handleIssueUpdate(data_3.issue);
                                        sonner_1.toast.success("Issue verified! +".concat(constants_1.POINTS.VERIFY, " points awarded."));
                                    }
                                    else {
                                        sonner_1.toast.error(data_3.error || 'Failed to verify');
                                    }
                                    return [3 /*break*/, 6];
                                case 4:
                                    error_3 = _a.sent();
                                    console.error(error_3);
                                    sonner_1.toast.error('Unexpected error occurred');
                                    return [3 /*break*/, 6];
                                case 5:
                                    setIsVerifying(false);
                                    return [7 /*endfinally*/];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); };
                    handleStatusUpdate = function () { return __awaiter(_this, void 0, void 0, function () {
                        var res_4, data_4, error_4;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    if (!user || user.role !== 'official' || !pendingStatus)
                                        return [2 /*return*/];
                                    setIsUpdatingStatus(true);
                                    _c.label = 1;
                                case 1:
                                    _c.trys.push([1, 4, 5, 6]);
                                    return [4 /*yield*/, fetch("/api/issues/".concat(id, "/status"), {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ status: pendingStatus }),
                                        })];
                                case 2:
                                    res_4 = _c.sent();
                                    return [4 /*yield*/, res_4.json()];
                                case 3:
                                    data_4 = _c.sent();
                                    if (res_4.ok) {
                                        handleIssueUpdate(data_4.issue);
                                        sonner_1.toast.success("Status updated to ".concat((_b = (_a = constants_1.STATUS_CONFIG[pendingStatus]) === null || _a === void 0 ? void 0 : _a.label) !== null && _b !== void 0 ? _b : pendingStatus));
                                    }
                                    else {
                                        sonner_1.toast.error(data_4.error || 'Failed to update status');
                                    }
                                    return [3 /*break*/, 6];
                                case 4:
                                    error_4 = _c.sent();
                                    console.error(error_4);
                                    sonner_1.toast.error('Unexpected error occurred');
                                    return [3 /*break*/, 6];
                                case 5:
                                    setIsUpdatingStatus(false);
                                    return [7 /*endfinally*/];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); };
                    if (loading) {
                        return [2 /*return*/, (<div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <lucide_react_1.Loader2 className="h-8 w-8 animate-spin text-primary"/>
      </div>)];
                    }
                    if (!issue) {
                        if (issueRemoved) {
                            return [2 /*return*/, (<div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <p className="text-muted-foreground">This issue was removed.</p>
        </div>)];
                        }
                        return [2 /*return*/, (<div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-muted-foreground">Issue not found</p>
      </div>)];
                    }
                    category = constants_1.CATEGORIES.find(function (c) { return c.value === issue.category; });
                    statusConfig = constants_1.STATUS_CONFIG[issue.status];
                    severityColor = constants_1.SEVERITY_COLORS[issue.severity];
                    reporter = typeof issue.reportedBy === 'object' ? issue.reportedBy : null;
                    reporterId = String((_a = reporter === null || reporter === void 0 ? void 0 : reporter._id) !== null && _a !== void 0 ? _a : issue.reportedBy);
                    canVerify = user &&
                        reporterId !== String(user._id) &&
                        !issue.verifiedBy.map(String).includes(String(user._id));
                    isReporter = user && reporterId === String(user._id);
                    isEditLocked = issue.upvotes.length > 0 || issue.verifiedBy.length > 0;
                    canEdit = Boolean(isReporter && !isEditLocked);
                    return [2 /*return*/, (<div className="container mx-auto p-4 md:p-8 max-w-6xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Image, Details, Map */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header & Image */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: "".concat(statusConfig === null || statusConfig === void 0 ? void 0 : statusConfig.bg), color: statusConfig === null || statusConfig === void 0 ? void 0 : statusConfig.color }}>
                {statusConfig === null || statusConfig === void 0 ? void 0 : statusConfig.label}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
                {category ? <category.icon className="h-3.5 w-3.5"/> : <lucide_react_1.MapPin className="h-3.5 w-3.5"/>}
                {(category === null || category === void 0 ? void 0 : category.label) || (0, constants_1.formatCategory)(issue.category)}
              </span>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white capitalize shadow-sm" style={{ backgroundColor: severityColor }}>
                Severity: {issue.severity}
              </span>
              
              {((_b = issue.mergedReportsCount) !== null && _b !== void 0 ? _b : 1) > 1 && (<span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Reported by {issue.mergedReportsCount} people
                </span>)}
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{issue.title}</h1>
                {issue.editedAt && (<p className="mt-1 text-sm text-muted-foreground">
                    Edited {(0, date_fns_1.format)(new Date(issue.editedAt), 'MMMM d, yyyy')}
                  </p>)}
              </div>

              {canEdit && !isEditing && (<button_1.Button variant="outline" size="sm" onClick={startEditing}>
                  <lucide_react_1.Edit3 className="mr-2 h-4 w-4"/>
                  Edit
                </button_1.Button>)}
            </div>

            {isReporter && isEditLocked && (<div className="flex items-start gap-2 rounded-[var(--radius-card)] border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
                <lucide_react_1.LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-primary"/>
                <span>Locked after first verification or upvote.</span>
              </div>)}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground pb-2">
              <div className="flex items-center gap-1">
                <lucide_react_1.Calendar className="h-4 w-4"/>
                {(0, date_fns_1.format)(new Date(issue.createdAt), 'MMMM d, yyyy')}
              </div>
              <div className="flex items-center gap-1">
                <lucide_react_1.MapPin className="h-4 w-4"/>
                {issue.location.ward || issue.location.city || 'Location Details'}
              </div>
            </div>

            {isEditing && (<form onSubmit={handleEditSubmit} className="space-y-5 rounded-[var(--radius-panel)] border border-primary/20 bg-card p-5 surface-raised">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold" htmlFor="edit-title">
                      Title
                    </label>
                    <input id="edit-title" required maxLength={100} className="w-full rounded-[var(--radius-control)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" value={editForm.title} onChange={function (e) {
                                    return setEditForm(function (prev) { return (__assign(__assign({}, prev), { title: e.target.value })); });
                                }}/>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Category</label>
                    <custom_select_1.CustomSelect value={editForm.category} onChange={function (category) {
                                    return setEditForm(function (prev) { return (__assign(__assign({}, prev), { category: category })); });
                                }} options={constants_1.CATEGORIES.map(function (category) { return ({
                                    value: category.value,
                                    label: category.label,
                                }); })}/>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Severity</label>
                    <custom_select_1.CustomSelect value={editForm.severity} onChange={function (severity) {
                                    return setEditForm(function (prev) { return (__assign(__assign({}, prev), { severity: severity })); });
                                }} options={[
                                    { value: 'low', label: 'Low' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'high', label: 'High' },
                                    { value: 'critical', label: 'Critical' },
                                ]}/>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold" htmlFor="edit-description">
                      Description
                    </label>
                    <textarea id="edit-description" required rows={4} className="w-full rounded-[var(--radius-control)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" value={editForm.description} onChange={function (e) {
                                    return setEditForm(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); });
                                }}/>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold" htmlFor="edit-address">
                      Address
                    </label>
                    <input id="edit-address" className="w-full rounded-[var(--radius-control)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" value={editForm.address} onChange={function (e) {
                                    return setEditForm(function (prev) { return (__assign(__assign({}, prev), { address: e.target.value })); });
                                }}/>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="edit-lat">
                      Latitude
                    </label>
                    <input id="edit-lat" required inputMode="decimal" className="w-full rounded-[var(--radius-control)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" value={editForm.lat} onChange={function (e) {
                                    return setEditForm(function (prev) { return (__assign(__assign({}, prev), { lat: e.target.value })); });
                                }}/>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold" htmlFor="edit-lng">
                      Longitude
                    </label>
                    <input id="edit-lng" required inputMode="decimal" className="w-full rounded-[var(--radius-control)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" value={editForm.lng} onChange={function (e) {
                                    return setEditForm(function (prev) { return (__assign(__assign({}, prev), { lng: e.target.value })); });
                                }}/>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold" htmlFor="edit-images">
                      Image URLs
                    </label>
                    <textarea id="edit-images" rows={3} className="w-full rounded-[var(--radius-control)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" value={editForm.images} onChange={function (e) {
                                    return setEditForm(function (prev) { return (__assign(__assign({}, prev), { images: e.target.value })); });
                                }}/>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button_1.Button type="button" variant="ghost" onClick={cancelEditing}>
                    <lucide_react_1.X className="mr-2 h-4 w-4"/>
                    Cancel
                  </button_1.Button>
                  <button_1.Button type="submit" disabled={isSavingEdit}>
                    {isSavingEdit ? (<lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>) : (<lucide_react_1.Save className="mr-2 h-4 w-4"/>)}
                    Save changes
                  </button_1.Button>
                </div>
              </form>)}

            {issue.images && issue.images.length > 0 && !issue.images[0].includes('placehold.co') && (<div className="relative aspect-video overflow-hidden rounded-[var(--radius-panel)] border bg-muted surface-raised">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={issue.images[0]} alt={issue.title} className="h-full w-full object-cover"/>
              </div>)}
            
            <div className="prose prose-sm md:prose-base dark:prose-invert mt-6 max-w-none rounded-[var(--radius-panel)] border bg-card p-6 surface-raised">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="whitespace-pre-wrap">{issue.description}</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-4 rounded-[var(--radius-panel)] border bg-card p-4 surface-flat">
            <UpvoteButton_1.UpvoteButton issueId={issue._id} upvotes={issue.upvotes} onUpdate={handleIssueUpdate} variant="default" className="h-10 px-6" showLabel/>
            
            {canVerify && (<button_1.Button variant="outline" className="h-10 gap-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10" onClick={handleVerify} disabled={isVerifying}>
                {isVerifying ? <lucide_react_1.Loader2 className="h-4 w-4 animate-spin"/> : <lucide_react_1.ShieldCheck className="h-4 w-4"/>}
                I&apos;m here — confirm this issue
              </button_1.Button>)}

            <div className="ml-auto text-sm text-muted-foreground flex items-center gap-2">
              <span className="font-semibold text-foreground">{issue.verifiedBy.length}</span> verifications
            </div>
          </div>

          {/* Map Location */}
          <div className="overflow-hidden rounded-[var(--radius-panel)] border bg-card surface-flat">
            <div className="p-4 border-b bg-muted/20">
              <h3 className="font-semibold flex items-center gap-2">
                <lucide_react_1.MapPin className="h-4 w-4"/>
                Reported Location
              </h3>
              {issue.location.address && (<p className="text-sm text-muted-foreground mt-1">{issue.location.address}</p>)}
            </div>
            <div className="h-[300px] w-full">
              <MapWrapper issues={[issue]} zoom={16}/>
            </div>
          </div>
          
          {/* Comments Section */}
          <div className="space-y-6 pt-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <lucide_react_1.MessageSquare className="h-5 w-5"/>
              Community Comments ({issue.comments.length})
            </h3>

            {user ? (<form onSubmit={handleComment} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                  {user.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.avatar} alt="You" className="h-full w-full object-cover"/>) : (<lucide_react_1.User className="h-5 w-5 text-primary"/>)}
                </div>
                <div className="flex-1 space-y-2">
                  <textarea required className="min-h-[80px] w-full rounded-[var(--radius-control)] border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" placeholder="Add an update or comment..." value={commentText} onChange={function (e) { return setCommentText(e.target.value); }}/>
                  <div className="flex justify-end">
                    <button_1.Button type="submit" disabled={isSubmitting} size="sm">
                      {isSubmitting ? <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/> : 'Post Comment'}
                    </button_1.Button>
                  </div>
                </div>
              </form>) : (<div className="rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                Please log in to add a comment.
              </div>)}

            <div className="space-y-4">
              {issue.comments.map(function (comment, index) {
                                var author = typeof comment.user === 'object' ? comment.user : null;
                                var isCommentOwner = user && author && String(author._id) === String(user._id);
                                return (<div key={index} className="flex gap-4 rounded-[var(--radius-card)] border bg-card p-4 surface-flat">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary overflow-hidden">
                      {(author === null || author === void 0 ? void 0 : author.avatar) ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={author.avatar} alt={author.name} className="h-full w-full object-cover"/>) : (<lucide_react_1.User className="h-5 w-5 text-muted-foreground"/>)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{(author === null || author === void 0 ? void 0 : author.name) || 'Unknown User'}</span>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{(author === null || author === void 0 ? void 0 : author.level) || 'user'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {(0, date_fns_1.formatDistanceToNow)(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                          {isCommentOwner && (<button onClick={function () { return handleDeleteComment(comment._id); }} className="text-xs text-destructive hover:underline" disabled={isSubmitting}>
                              Delete
                            </button>)}
                        </div>
                      </div>
                      <p className="text-sm text-card-foreground whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  </div>);
                            })}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline & Reporter info */}
        <div className="space-y-6">
          <div className="sticky top-24 overflow-hidden rounded-[var(--radius-panel)] border bg-card surface-flat">
            <div className="p-4 border-b bg-muted/20">
              <h3 className="font-semibold">Issue Timeline</h3>
            </div>
            <div className="p-6">
              <StatusTimeline_1.StatusTimeline history={issue.statusHistory}/>
            </div>
            
            <div className="border-t p-4 bg-muted/10">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Reported By</h4>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                  {(reporter === null || reporter === void 0 ? void 0 : reporter.avatar) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={reporter.avatar} alt={reporter.name} className="h-full w-full object-cover"/>) : (<lucide_react_1.User className="h-5 w-5 text-primary"/>)}
                </div>
                <div>
                  <div className="font-medium text-sm">{(reporter === null || reporter === void 0 ? void 0 : reporter.name) || 'Anonymous'}</div>
                  <div className="text-xs text-primary font-medium capitalize">{(reporter === null || reporter === void 0 ? void 0 : reporter.level) || 'Newcomer'}</div>
                </div>
              </div>
            </div>
          </div>

          {(user === null || user === void 0 ? void 0 : user.role) === 'official' && (<div className="overflow-hidden rounded-[var(--radius-panel)] border border-primary/20 bg-card surface-flat">
              <div className="border-b bg-primary/5 p-4">
                <h3 className="font-semibold text-primary">Status Controls</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Official actions — updates persist to the database immediately.
                </p>
              </div>
              <div className="space-y-3 p-4">
                <custom_select_1.CustomSelect value={pendingStatus} onChange={setPendingStatus} options={Object.entries(constants_1.STATUS_CONFIG).map(function (_a) {
                                    var value = _a[0], config = _a[1];
                                    return ({
                                        value: value,
                                        label: config.label,
                                    });
                                })}/>
                <button_1.Button className="w-full" onClick={handleStatusUpdate} disabled={isUpdatingStatus ||
                                    !pendingStatus ||
                                    pendingStatus === issue.status}>
                  {isUpdatingStatus ? (<>
                      <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                      Updating…
                    </>) : ('Update Status')}
                </button_1.Button>
              </div>
            </div>)}
        </div>

      </div>
    </div>)];
                case 4: return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
}
