export type UserRole = 'admin' | 'program_officer' | 'deputy_manager' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
}

export interface Student {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  email: string;
  contactNumber: string;
  community: string;
  guardianFullName: string;
  guardianCommunity: string;
  guardianContactNumber: string;
  chlNumber: string;
  schoolIdNumber: string;
  nrcNumber: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  age: number;
  currentProgram: string;
  programLevel: 'university' | 'diploma' | 'trade';
  programStatus: 'enrolled' | 'graduated' | 'discharged' | 'suspended' | 'transferred';
  academicStanding: 'good' | 'probation' | 'warning' | 'excellent';
  institutionName: string;
  institutionLocation: string;
  areaOfStudy: string;
  programLength: string; // e.g., "4 years", "2 years"
  startDate: string;
  expectedEndDate: string;
  actualGraduationDate?: string;
  isOnTrack: boolean;
  assignedOfficer: string;
  joinDate: string;
  programNotes: string;
  grades: Grade[];
  semesterAverages: SemesterAverage[];
  overallGPA: number;
  accommodation: AccommodationInfo;
  notes: StudentNote[];
  chatMessages: ChatMessage[];
}

export interface StudentNote {
  id: string;
  studentId: string;
  title: string;
  content: string;
  category: 'academic' | 'personal' | 'financial' | 'health' | 'accommodation' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdBy: string;
  createdDate: string;
  updatedBy?: string;
  updatedDate?: string;
  isPrivate: boolean;
  tags: string[];
  attachments?: string[];
}

export interface ChatMessage {
  id: string;
  studentId: string;
  message: string;
  author: string;
  authorRole: UserRole;
  createdDate: string;
  isEdited: boolean;
  editedDate?: string;
  replyTo?: string;
  attachments?: string[];
  reactions: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface Grade {
  id: string;
  semester: string;
  year: number;
  courseName: string;
  courseCode: string;
  credits: number;
  grade: string; // A+, A, B+, B, C+, C, D+, D, F
  gradePoints: number; // 4.0 scale
  uploadedDate: string;
  uploadedBy: string;
  documentUrl?: string;
}

export interface SemesterAverage {
  semester: string;
  year: number;
  gpa: number;
  totalCredits: number;
  status: 'completed' | 'in_progress';
}

export interface AccommodationInfo {
  type: 'university_hostel' | 'private_rental' | 'family_home' | 'other';
  address: string;
  landlordName?: string;
  landlordContact?: string;
  monthlyRent: number;
  paymentMethod: 'direct_to_landlord' | 'student_stipend' | 'mixed';
  contractStartDate: string;
  contractEndDate: string;
  notes: string;
}

export interface Allowance {
  id: string;
  studentId: string;
  studentName: string;
  month: string;
  year: number;
  programLevel: 'launch_year' | 'university' | 'college';
  stipend: number;
  medical: number;
  transportation: number;
  schoolSupplies: number;
  accommodation: number;
  total: number;
  approvalStage: 'pending_dpm' | 'pending_flmi' | 'pending_pm' | 'approved' | 'rejected' | 'paid';
  submittedBy: string;
  submittedById: string;
  submittedDate: string;
  dpmApprovedBy?: string;
  dpmApprovedById?: string;
  dpmApprovedDate?: string;
  dpmStatus?: 'approved' | 'denied';
  dpmComments?: string;
  flmiApprovedBy?: string;
  flmiApprovedById?: string;
  flmiApprovedDate?: string;
  flmiStatus?: 'approved' | 'denied';
  flmiComments?: string;
  pmApprovedBy?: string;
  pmApprovedById?: string;
  pmApprovedDate?: string;
  pmStatus?: 'approved' | 'denied';
  pmComments?: string;
  rejectionReason?: string;
  rejectedAtStage?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  flmzComments?: string;
}

export interface AllowanceComment {
  id: string;
  allowanceId: string;
  userId: string;
  userName: string;
  userRole: 'program_officer' | 'deputy_manager' | 'flmi_advisor' | 'program_manager' | 'admin';
  action: 'comment' | 'approved' | 'denied' | 'submitted' | 'paid' | 'revised';
  commentText?: string;
  stage: 'submission' | 'dpm_review' | 'flmi_review' | 'pm_review' | 'payment';
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'completed';
  category: string;
  createdDate: string;
  completedDate?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  studentId: string;
  studentName: string;
  reportedBy: string;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: 'academic' | 'financial' | 'health' | 'accommodation' | 'personal' | 'other';
  createdDate: string;
  resolvedDate?: string;
  comments: Comment[];
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdDate: string;
}

export interface Form {
  id: string;
  type: 'home_visit' | 'discharge' | 'care_call';
  studentId: string;
  studentName: string;
  completedBy: string;
  completedDate: string;
  data: Record<string, any>;
  status: 'draft' | 'completed' | 'reviewed';
}

export interface StudentFile {
  id: string;
  studentId: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedDate: string;
  category: 'academic' | 'personal' | 'financial' | 'medical' | 'other';
  url: string;
}

export interface LibraryResource {
  id: string;
  title: string;
  description: string;
  type: 'book' | 'audiobook' | 'video' | 'podcast';
  category: 'academic' | 'personal_development' | 'career' | 'life_skills' | 'entertainment';
  author?: string;
  duration?: string;
  fileSize?: number;
  thumbnailUrl: string;
  resourceUrl: string;
  uploadedBy: string;
  uploadedDate: string;
  downloads: number;
  rating: number;
  tags: string[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'urgent' | 'academic' | 'financial' | 'event';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: 'all' | 'students' | 'officers' | 'admin';
  author: string;
  createdDate: string;
  expiryDate?: string;
  isActive: boolean;
  attachments?: string[];
  readBy: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'seminar' | 'networking' | 'graduation' | 'orientation' | 'social';
  date: string;
  time: string;
  location: string;
  isVirtual: boolean;
  virtualLink?: string;
  organizer: string;
  maxAttendees?: number;
  currentAttendees: number;
  registrationDeadline: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  imageUrl: string;
  attendees: string[];
  requirements?: string[];
  tags: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdDate: string;
}

export interface UserProfile extends User {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  profilePicture?: string;
  isActive: boolean;
  lastLogin?: string;
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  permissions: string[];
}

export interface Landlord {
  id: string;
  name: string;
  boarding_house_name: string;
  cell_line?: string;
  landline?: string;
  address?: string;
  email?: string;
  geolocation?: string;
  total_students: number;
  lease_agreement_signed: boolean;
  comments?: string;
  created_at: string;
  updated_at: string;
}

export interface Institution {
  id: string;
  liaison_name: string;
  liaison_role?: string;
  cell_line?: string;
  institution_direct_line?: string;
  institution_name: string;
  department?: string;
  liaison_email?: string;
  institution_email?: string;
  geolocation?: string;
  mou_signed: boolean;
  comments?: string;
  created_at: string;
  updated_at: string;
}