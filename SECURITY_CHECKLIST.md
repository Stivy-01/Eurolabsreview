# 🔒 Security Checklist for eurolabreviews.eu

## Domain Security

### ✅ SSL/HTTPS
- [x] SSL certificate enabled (Vercel provides automatically)
- [x] HTTPS redirect configured
- [x] HSTS headers enabled (configured in next.config.ts)

### ✅ DNS Security
- [x] Using Vercel nameservers (ns1.vercel-dns.com, ns2.vercel-dns.com)
- [x] DNSSEC automatically managed by Vercel
- [x] DNS records configured correctly
- [ ] Regular DNS security audits

### ✅ Security Headers
- [x] X-Frame-Options: DENY (prevents clickjacking)
- [x] X-Content-Type-Options: nosniff (prevents MIME sniffing)
- [x] Referrer-Policy: strict-origin-when-cross-origin
- [x] X-XSS-Protection: 1; mode=block
- [x] Strict-Transport-Security: max-age=31536000; includeSubDomains
- [x] Content-Security-Policy: configured for Supabase

## Application Security

### ✅ Environment Variables
- [x] NEXT_PUBLIC_SUPABASE_URL (public, safe)
- [x] NEXT_PUBLIC_SUPABASE_ANON_KEY (public, safe)
- [x] SUPABASE_SERVICE_ROLE_KEY (private, keep secret)
- [ ] OPENAI_API_KEY (private, if using AI moderation)

### ✅ Database Security
- [x] Supabase Row Level Security (RLS) enabled
- [x] API keys properly configured
- [x] Database backups enabled
- [ ] Regular security audits

### ✅ Content Moderation
- [x] Real-time content filtering
- [x] Banned words detection
- [x] Length validation
- [x] Caps detection
- [ ] Optional AI moderation (OpenAI)

## Monitoring & Alerts

### ✅ Set up monitoring for:
- [ ] Domain expiration alerts (Porkbun)
- [ ] SSL certificate expiration (Vercel)
- [ ] DNS changes (Vercel)
- [ ] Unusual traffic patterns (Vercel Analytics)
- [ ] Failed login attempts (Supabase)

## Privacy & GDPR Compliance

### ✅ Data Protection
- [x] Anonymous reviews supported
- [x] Right to be forgotten implemented
- [x] Data stored in EU (Supabase)
- [ ] Privacy policy page
- [ ] Terms of service page
- [ ] Cookie consent (if needed)

## Regular Security Tasks

### Monthly:
- [ ] Review Vercel access logs
- [ ] Update npm dependencies
- [ ] Check for security patches
- [ ] Review user reports
- [ ] Test backup restoration

### Quarterly:
- [ ] Security audit
- [ ] Penetration testing
- [ ] Backup verification
- [ ] SSL certificate renewal check
- [ ] Review Supabase security settings

### Annually:
- [ ] Domain renewal (Porkbun)
- [ ] Comprehensive security review
- [ ] Privacy policy updates
- [ ] GDPR compliance check

## Emergency Contacts

- **Domain Registrar:** Porkbun support (support@porkbun.com)
- **Hosting:** Vercel support (https://vercel.com/support)
- **Database:** Supabase support (https://supabase.com/support)
- **Security Issues:** Create GitHub issue in your repository

## Security Tools to Consider

1. **SSL Labs Test:** https://www.ssllabs.com/ssltest/analyze.html?d=eurolabreviews.eu
2. **Security Headers Check:** https://securityheaders.com/?q=eurolabreviews.eu
3. **DNS Security Check:** https://dnschecker.org/dnssec/eurolabreviews.eu
4. **Vulnerability Scanner:** OWASP ZAP
5. **Domain Health:** https://mxtoolbox.com/eurolabreviews.eu

## Current Security Status

### ✅ **COMPLETED:**
- SSL/HTTPS with HSTS
- DNSSEC (managed by Vercel)
- Security headers configured
- Content moderation system
- Anonymous reviews
- EU data storage

### 🔄 **IN PROGRESS:**
- Privacy policy page
- Terms of service page
- Monitoring setup

### ⚠️ **TO DO:**
- SUPABASE_SERVICE_ROLE_KEY environment variable
- Regular security audits
- Monitoring alerts setup

## Incident Response Plan

1. **Immediate Actions:**
   - Assess the threat
   - Take affected systems offline if necessary
   - Document the incident
   - Contact Vercel/Supabase support if needed

2. **Communication:**
   - Notify users if personal data is compromised
   - Update status page
   - Contact relevant authorities if required

3. **Recovery:**
   - Restore from Supabase backups
   - Implement additional security measures
   - Conduct post-incident review

## Quick Security Commands

```bash
# Check SSL certificate
curl -I https://eurolabreviews.eu

# Check security headers
curl -I https://eurolabreviews.eu

# Update dependencies
npm audit
npm update

# Check for vulnerabilities
npm audit fix
```

## Domain-Specific Notes

- **Domain:** eurolabreviews.eu
- **Registrar:** Porkbun
- **Hosting:** Vercel
- **Database:** Supabase
- **DNS:** Vercel nameservers
- **SSL:** Vercel (automatic)
- **DNSSEC:** Vercel (automatic) 