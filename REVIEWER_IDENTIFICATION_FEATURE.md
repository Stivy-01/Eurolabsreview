# Reviewer Identification Feature

## 🎯 Overview

This feature allows reviewers to choose whether to remain anonymous or be identified when posting reviews. This enhances credibility and accountability while respecting different comfort levels.

## ✨ Features

### **Anonymous Reviews (Default)**
- 🔒 Reviews posted without reviewer identification
- Default behavior for privacy-conscious users
- Shows "🔒 Anonymous" in review cards

### **Identified Reviews**
- 👤 Reviews posted with reviewer name/nickname
- Increases trust and credibility
- Enables networking between researchers
- Shows "👤 [Name]" in review cards

## 🛠️ Implementation

### **Database Changes**
- Added `is_anonymous` (BOOLEAN, default TRUE)
- Added `reviewer_name` (TEXT, nullable)
- Added index for performance optimization

### **Form Updates**
- Checkbox to toggle anonymous/identified mode
- Name/nickname input field (appears when not anonymous)
- Real-time validation and feedback
- Clear visual indicators of current mode

### **API Updates**
- Validates reviewer name when not anonymous
- Handles both anonymous and identified submissions
- Maintains backward compatibility

### **UI Updates**
- Review cards show reviewer status
- Anonymous: "🔒 Anonymous"
- Identified: "👤 [Reviewer Name]"
- Consistent styling and icons

## 📊 Benefits

### **For Reviewers**
- **Choice**: Decide on privacy level
- **Credibility**: Identified reviews are more trusted
- **Networking**: Connect with other researchers
- **Accountability**: Encourage thoughtful reviews

### **For Readers**
- **Trust**: Identified reviews feel more reliable
- **Transparency**: Know who wrote the review
- **Quality**: Reduced fake/troll reviews
- **Connection**: Reach out to reviewers if needed

### **For Platform**
- **Quality Control**: Better review standards
- **User Engagement**: More meaningful interactions
- **Growth**: Attract serious researchers
- **Reputation**: Build credibility in the community

## 🔧 Technical Details

### **Database Schema**
```sql
ALTER TABLE reviews 
ADD COLUMN is_anonymous BOOLEAN DEFAULT TRUE,
ADD COLUMN reviewer_name TEXT;
```

### **Form State**
```typescript
interface FormData {
  // ... existing fields
  isAnonymous: boolean;
  reviewerName: string;
}
```

### **API Validation**
- Requires reviewer name when `is_anonymous = false`
- Minimum 2 characters for reviewer name
- Trims whitespace and validates input

### **Display Logic**
```typescript
{!review.is_anonymous && review.reviewer_name ? (
  <div>👤 {review.reviewer_name}</div>
) : (
  <div>🔒 Anonymous</div>
)}
```

## 🚀 Usage

### **For Anonymous Reviews**
1. Leave "Keep my review anonymous" checked
2. Submit review normally
3. Review appears as "🔒 Anonymous"

### **For Identified Reviews**
1. Uncheck "Keep my review anonymous"
2. Enter your name or nickname
3. Submit review
4. Review appears as "👤 [Your Name]"

## 🔒 Privacy & Security

- **Default**: All reviews are anonymous by default
- **Choice**: Users explicitly opt-in to identification
- **Validation**: Names are validated and sanitized
- **Flexibility**: Can use real name or nickname
- **Reversible**: Can change mind before submission

## 📈 Future Enhancements

- **Profile Pages**: Dedicated pages for identified reviewers
- **Reviewer Stats**: Show reviewer's review history
- **Verification**: Email verification for identified reviewers
- **Badges**: Special badges for verified reviewers
- **Moderation**: Enhanced moderation for identified reviews

## 🎨 UI/UX Considerations

- **Clear Choice**: Obvious toggle between anonymous/identified
- **Visual Feedback**: Immediate indication of current mode
- **Helpful Text**: Explains benefits of each option
- **Consistent Icons**: 🔒 for anonymous, 👤 for identified
- **Responsive Design**: Works on all screen sizes

This feature strikes the perfect balance between privacy and credibility, giving users the choice while encouraging higher-quality, more trustworthy reviews. 