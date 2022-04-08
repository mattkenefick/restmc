
import UserCollection from '../collections/UserCollection';
import { Model } from '../../src/index';

/**
 * User Model
 *
 * @type Model
 */
export default class UserModel extends Model
{
    /**
     * Endpoint key
     *
     * https://api.sotw.com/v1/{endpoint}
     *
     * @type string
     */
    public endpoint: string = 'user';

    /**
     * List of fields available
     *
     * @type string[]
     */
    public fields: string[] = [
        'person_id',
        'content_id',
        'username',
        'slug',
        'email',
        'account_id',
        'account_type',
        'password',
        'role',
        'status',
        'ip',
        'active_at',
    ];


    // Relationships
    // -------------------------------------------------------------------------

    public get testRelationship(): UserCollection
    {
        return this.hasMany('userRelationship', UserCollection);
    }
}
