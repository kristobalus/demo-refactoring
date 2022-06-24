import passport = require('passport');
import { UniqueTokenStrategy } from 'passport-unique-token'
import { CompanyRepository } from "../repositories/company-repository";

export class AuthenticationMiddleware {

    constructor(
        private companyRepository: CompanyRepository,
        private tokenHeader: string
    ) {

        passport.use(new UniqueTokenStrategy({ tokenHeader: this.tokenHeader },
            (token, done) => {
                this.companyRepository.findByToken(token)
                    .then(company => {
                        done(null, company ?? false);
                    })
                    .catch(err => done(err))
            }
        ));
    }

    init() {
        return passport.initialize()
    }

    token() {
        return passport.authenticate('token', { session: false })
    }

}